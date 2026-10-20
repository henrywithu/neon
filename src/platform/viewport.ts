/** Layout viewport dimensions never depend on the canvas's previous intrinsic size. */
export function measureViewport() {
  const root = document.documentElement;
  const visual = window.visualViewport;
  return {
    width: Math.max(1, root.clientWidth || window.innerWidth),
    height: Math.max(1, visual && visual.scale === 1 ? Math.min(root.clientHeight, visual.height) : root.clientHeight || window.innerHeight)
  };
}

export function observeViewport(onResize: () => void) {
  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('neon:clear-input'));
      const { width, height } = measureViewport();
      document.documentElement.style.setProperty('--view-width', `${width}px`);
      document.documentElement.style.setProperty('--view-height', `${height}px`);
      onResize();
    });
  };
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', update);
  window.visualViewport?.addEventListener('resize', update);
  update();
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', update);
    window.removeEventListener('orientationchange', update);
    window.visualViewport?.removeEventListener('resize', update);
  };
}
