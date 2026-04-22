// Filozof AI — ses + görüntü istemci mantığı

const els = {
  video: document.getElementById("video"),
  overlay: document.getElementById("video-overlay"),
  chat: document.getElementById("chat"),
  transcript: document.getElementById("transcript-live"),
  btnStart: document.getElementById("btn-start"),
  btnStop: document.getElementById("btn-stop"),
  btnText: document.getElementById("btn-send-text"),
  toggleVoice: document.getElementById("toggle-voice"),
  toggleCamera: document.getElementById("toggle-camera"),
  statusDot: document.getElementById("status-dot"),
  statusText: document.getElementById("status-text"),
  errorDialog: document.getElementById("error-dialog"),
  errorText: document.getElementById("error-text"),
};

const state = {
  stream: null,
  recognition: null,
  recognizing: false,
  thinking: false,
  speaking: false,
  pendingTranscript: "",
  silenceTimer: null,
  history: [],
  canvas: document.createElement("canvas"),
  voiceReady: false,
};

const SILENCE_MS = 1500;
const CAMERA_FRAME_MAX = 1024;

function setStatus(kind, text) {
  els.statusDot.className = "dot " + (kind || "");
  els.statusText.textContent = text;
}

function showError(msg) {
  els.errorText.textContent = msg;
  if (typeof els.errorDialog.showModal === "function") {
    els.errorDialog.showModal();
  } else {
    alert(msg);
  }
}

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = "message " + (role === "user" ? "user" : "model");
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  text.split(/\n{2,}/).forEach((para) => {
    const p = document.createElement("p");
    p.textContent = para.trim();
    if (p.textContent) bubble.appendChild(p);
  });
  if (!bubble.childNodes.length) bubble.textContent = text;
  div.appendChild(bubble);
  els.chat.appendChild(div);
  els.chat.scrollTop = els.chat.scrollHeight;
  return div;
}

function appendTypingIndicator() {
  const div = document.createElement("div");
  div.className = "message model typing";
  div.innerHTML = '<div class="bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
  els.chat.appendChild(div);
  els.chat.scrollTop = els.chat.scrollHeight;
  return div;
}

function captureFrameBase64() {
  if (!state.stream || !els.toggleCamera.checked) return null;
  const video = els.video;
  if (!video.videoWidth || !video.videoHeight) return null;
  const scale = Math.min(1, CAMERA_FRAME_MAX / Math.max(video.videoWidth, video.videoHeight));
  const w = Math.round(video.videoWidth * scale);
  const h = Math.round(video.videoHeight * scale);
  state.canvas.width = w;
  state.canvas.height = h;
  const ctx = state.canvas.getContext("2d");
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -w, 0, w, h);
  ctx.restore();
  return state.canvas.toDataURL("image/jpeg", 0.7);
}

async function streamFromBackend(message, onChunk) {
  const image_base64 = captureFrameBase64();
  const payload = {
    message,
    image_base64,
    history: state.history.slice(-20),
  };
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = `Sunucu hatası (${res.status})`;
    try { detail = (await res.json()).detail || detail; } catch (_) {}
    throw new Error(detail);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const line = rawEvent.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr) continue;
      let obj;
      try { obj = JSON.parse(jsonStr); } catch { continue; }
      if (obj.error) throw new Error(obj.error);
      if (obj.text) {
        full += obj.text;
        onChunk(obj.text, full);
      }
      if (obj.done) return full;
    }
  }
  return full;
}

function speakReply(text) {
  if (!els.toggleVoice.checked) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "tr-TR";
  utter.rate = 1.0;
  utter.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const trVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("tr"));
  if (trVoice) utter.voice = trVoice;
  utter.onstart = () => {
    state.speaking = true;
    setStatus("speaking", "Konuşuyor…");
    stopRecognition();
  };
  utter.onend = utter.onerror = () => {
    state.speaking = false;
    if (state.stream && !state.thinking) {
      startRecognition();
    }
  };
  window.speechSynthesis.speak(utter);
}

function renderBubbleContent(bubble, text) {
  bubble.innerHTML = "";
  const parts = text.split(/\n{2,}/);
  parts.forEach((para) => {
    const p = document.createElement("p");
    p.textContent = para.trim();
    if (p.textContent) bubble.appendChild(p);
  });
  if (!bubble.childNodes.length) bubble.textContent = text;
}

async function handleUserMessage(text) {
  const clean = (text || "").trim();
  if (!clean) return;
  if (state.thinking) return;
  appendMessage("user", clean);
  state.history.push({ role: "user", text: clean });
  state.thinking = true;
  setStatus("thinking", "Düşünüyor…");
  stopRecognition();

  const typingEl = appendTypingIndicator();
  let streamMsg = null;
  let streamBubble = null;

  try {
    const reply = await streamFromBackend(clean, (_chunk, full) => {
      if (!streamMsg) {
        typingEl.remove();
        streamMsg = document.createElement("div");
        streamMsg.className = "message model streaming";
        streamBubble = document.createElement("div");
        streamBubble.className = "bubble";
        streamMsg.appendChild(streamBubble);
        els.chat.appendChild(streamMsg);
      }
      renderBubbleContent(streamBubble, full);
      els.chat.scrollTop = els.chat.scrollHeight;
    });

    if (streamMsg) streamMsg.classList.remove("streaming");
    else {
      typingEl.remove();
      appendMessage("model", reply);
    }
    state.history.push({ role: "model", text: reply });

    if (els.toggleVoice.checked) {
      speakReply(reply);
    } else if (state.stream) {
      setStatus("listening", "Dinleniyor…");
      startRecognition();
    } else {
      setStatus("", "Hazır");
    }
  } catch (err) {
    typingEl.remove();
    if (streamMsg) streamMsg.remove();
    console.error(err);
    showError(err.message || "Beklenmeyen bir hata oluştu.");
    setStatus("error", "Hata oluştu");
    if (state.stream && !els.toggleVoice.checked) startRecognition();
  } finally {
    state.thinking = false;
  }
}

function scheduleSilenceFlush() {
  clearTimeout(state.silenceTimer);
  state.silenceTimer = setTimeout(() => {
    const txt = state.pendingTranscript.trim();
    state.pendingTranscript = "";
    els.transcript.textContent = "";
    if (txt) handleUserMessage(txt);
  }, SILENCE_MS);
}

function setupRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showError(
      "Tarayıcınız sesli tanımayı desteklemiyor. Chrome veya Edge ile açın, " +
      "ya da 'Yazılı mesaj gönder' butonunu kullanın."
    );
    return null;
  }
  const rec = new SR();
  rec.lang = "tr-TR";
  rec.continuous = true;
  rec.interimResults = true;

  rec.onresult = (event) => {
    let interim = "";
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i];
      if (r.isFinal) finalText += r[0].transcript + " ";
      else interim += r[0].transcript;
    }
    if (finalText) {
      state.pendingTranscript = (state.pendingTranscript + " " + finalText).trim();
    }
    els.transcript.textContent = (state.pendingTranscript + " " + interim).trim();
    if (state.pendingTranscript || interim) scheduleSilenceFlush();
  };
  rec.onerror = (e) => {
    if (e.error === "no-speech" || e.error === "aborted") return;
    console.warn("SpeechRecognition error:", e.error);
    if (e.error === "not-allowed") {
      showError("Mikrofon izni reddedildi. Tarayıcı ayarlarından izin verin.");
    }
  };
  rec.onend = () => {
    state.recognizing = false;
    if (state.stream && !state.thinking && !state.speaking && els.toggleVoice.checked) {
      try { rec.start(); state.recognizing = true; } catch (_) {}
    }
  };
  return rec;
}

function startRecognition() {
  if (!state.recognition || state.recognizing || !els.toggleVoice.checked) return;
  try {
    state.recognition.start();
    state.recognizing = true;
    setStatus("listening", "Dinleniyor…");
  } catch (err) {
    // already started
  }
}

function stopRecognition() {
  if (state.recognition && state.recognizing) {
    try { state.recognition.stop(); } catch (_) {}
    state.recognizing = false;
  }
  clearTimeout(state.silenceTimer);
}

async function start() {
  try {
    const constraints = {
      video: els.toggleCamera.checked ? { width: 1280, height: 720 } : false,
      audio: true,
    };
    state.stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    showError(
      "Kamera/mikrofon erişimi alınamadı: " + (err.message || err.name) +
      ". Tarayıcı adres çubuğundaki izinleri kontrol edin."
    );
    return;
  }

  if (els.toggleCamera.checked) {
    els.video.srcObject = state.stream;
    els.overlay.classList.add("hidden");
  } else {
    els.overlay.classList.remove("hidden");
    els.overlay.textContent = "Kamera kapalı";
  }

  if (!state.recognition) state.recognition = setupRecognition();
  if (state.recognition && els.toggleVoice.checked) startRecognition();
  else setStatus("", "Hazır (sesli mod kapalı — yazılı mesaj kullanın)");

  els.btnStart.disabled = true;
  els.btnStop.disabled = false;
}

function stop() {
  stopRecognition();
  window.speechSynthesis?.cancel();
  if (state.stream) {
    state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
  }
  els.video.srcObject = null;
  els.overlay.classList.remove("hidden");
  els.overlay.textContent = "Kamera kapalı";
  els.btnStart.disabled = false;
  els.btnStop.disabled = true;
  setStatus("", "Durduruldu");
}

els.btnStart.addEventListener("click", start);
els.btnStop.addEventListener("click", stop);
els.btnText.addEventListener("click", () => {
  const msg = prompt("Filozof'a soracağın soru:");
  if (msg) handleUserMessage(msg);
});
els.toggleVoice.addEventListener("change", () => {
  if (!els.toggleVoice.checked) {
    stopRecognition();
    window.speechSynthesis?.cancel();
    setStatus("", "Sesli mod kapalı");
  } else if (state.stream && !state.thinking) {
    startRecognition();
  }
});
els.toggleCamera.addEventListener("change", async () => {
  if (state.stream) {
    stop();
    await start();
  } else {
    els.overlay.textContent = els.toggleCamera.checked
      ? "Başla'ya bas"
      : "Kamera kapalı";
  }
});

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => { state.voiceReady = true; };
}

setStatus("", "Hazır — 'Başla' tuşuna bas");
