export async function toggleFullscreen(): Promise<void> {
  const doc: any = document;
  const el: any = document.documentElement;
  try {
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      try {
        const scr: any = window.screen;
        if (scr.orientation && scr.orientation.lock) await scr.orientation.lock('landscape');
      } catch {}
    } else {
      if (doc.exitFullscreen) await doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
    }
  } catch (e) {
    console.warn('fullscreen failed', e);
  }
}
