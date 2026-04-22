"""Gemini API wrapper — vision + text, streaming destekli, hata yakalamalı."""

import base64
import os
from io import BytesIO
from typing import Iterator, Optional

import google.generativeai as genai
from PIL import Image

from app.philosophers import build_system_prompt


GENERATION_CONFIG = {
    "temperature": 0.85,
    "top_p": 0.95,
    "max_output_tokens": 1024,
}


class GeminiError(Exception):
    """Kullanıcıya gösterilecek Türkçe hata mesajı taşır."""


_MODEL_CACHE: dict[str, genai.GenerativeModel] = {}


def _get_model() -> genai.GenerativeModel:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        raise GeminiError(
            "GEMINI_API_KEY tanımlı değil. "
            "https://aistudio.google.com/apikey adresinden ücretsiz bir anahtar "
            "alıp .env dosyasına ekleyin."
        )

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    cache_key = f"{api_key[:8]}:{model_name}"
    if cache_key not in _MODEL_CACHE:
        genai.configure(api_key=api_key)
        _MODEL_CACHE[cache_key] = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=build_system_prompt(),
        )
    return _MODEL_CACHE[cache_key]


def _decode_image(image_base64: str) -> Optional[Image.Image]:
    if not image_base64:
        return None
    payload = image_base64.split(",", 1)[-1]
    try:
        raw = base64.b64decode(payload)
        img = Image.open(BytesIO(raw))
        img.load()
        max_side = 1024
        if max(img.size) > max_side:
            img.thumbnail((max_side, max_side))
        return img
    except Exception as exc:
        raise GeminiError(f"Görüntü çözümlenemedi: {exc}") from exc


def _build_contents(
    message: str,
    image: Optional[Image.Image],
    history: list[dict],
) -> list:
    contents: list = []
    for turn in history[-10:]:
        role = turn.get("role")
        text = (turn.get("text") or "").strip()
        if not text or role not in {"user", "model"}:
            continue
        contents.append({"role": role, "parts": [text]})

    user_parts: list = []
    if image is not None:
        user_parts.append(image)
    user_parts.append(message.strip() or "(kullanıcı konuşmadı — ortamdan bir şey sor)")
    contents.append({"role": "user", "parts": user_parts})
    return contents


def _friendly_error(exc: Exception) -> GeminiError:
    err_text = str(exc).lower()
    if "quota" in err_text or "429" in err_text or "resource_exhausted" in err_text:
        return GeminiError(
            "Gemini ücretsiz kota doldu (dakikada 15 / günde 1500 istek). "
            "Bir süre bekleyip tekrar deneyin."
        )
    if "api key" in err_text or "permission" in err_text or "401" in err_text:
        return GeminiError(
            "Gemini API anahtarı geçersiz. .env içindeki GEMINI_API_KEY'i kontrol edin."
        )
    return GeminiError(f"Gemini isteği başarısız: {exc}")


def generate_reply(
    message: str,
    image_base64: Optional[str] = None,
    history: Optional[list[dict]] = None,
) -> str:
    """Tek parça (non-streaming) filozof cevabı."""
    model = _get_model()
    image = _decode_image(image_base64) if image_base64 else None
    contents = _build_contents(message, image, history or [])

    try:
        response = model.generate_content(contents, generation_config=GENERATION_CONFIG)
    except Exception as exc:
        raise _friendly_error(exc) from exc

    text = (getattr(response, "text", "") or "").strip()
    if not text:
        raise GeminiError(
            "Gemini boş yanıt döndürdü. Sorunuzu yeniden formüle edip tekrar deneyin."
        )
    return text


def generate_reply_stream(
    message: str,
    image_base64: Optional[str] = None,
    history: Optional[list[dict]] = None,
) -> Iterator[str]:
    """Gemini'den cevabı parça parça (streaming) al.

    Her yield edilen string, birikmiş cevabın bir sonraki parçasıdır.
    Boş string yield edilmez. Hatalar GeminiError olarak fırlatılır.
    """
    model = _get_model()
    image = _decode_image(image_base64) if image_base64 else None
    contents = _build_contents(message, image, history or [])

    try:
        stream = model.generate_content(
            contents,
            generation_config=GENERATION_CONFIG,
            stream=True,
        )
    except Exception as exc:
        raise _friendly_error(exc) from exc

    any_chunk = False
    try:
        for chunk in stream:
            piece = getattr(chunk, "text", None)
            if piece:
                any_chunk = True
                yield piece
    except Exception as exc:
        raise _friendly_error(exc) from exc

    if not any_chunk:
        raise GeminiError(
            "Gemini boş yanıt döndürdü. Sorunuzu yeniden formüle edip tekrar deneyin."
        )
