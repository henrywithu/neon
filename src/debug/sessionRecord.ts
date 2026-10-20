/** Opt-in, bounded traces for named hardware sessions; software timing is not a release baseline. */
type Metadata = { device: string; browser: string; preset: string; network: string; route: string; cache: 'cold' | 'warm' };
let recording: { metadata: Metadata; start: number; frames: number[]; longTasks: { start: number; duration: number }[] } | null = null;
let usableAt: number | null = null;
let firstMoveAt: number | null = null;
export function markUsableDrive() { usableAt ??= performance.now(); }
export function sampleDriveFrame(frameMs: number, moving: boolean, active: boolean) {
  if (moving) firstMoveAt ??= performance.now();
  if (recording && active && recording.frames.length < 100000) recording.frames.push(frameMs);
}
export function installSessionRecorder() {
  if (!new URLSearchParams(location.search).has('perf') && !new URLSearchParams(location.search).has('debug')) return;
  performance.setResourceTimingBufferSize(2000);
  try {
    new PerformanceObserver(list => {
      if (recording) recording.longTasks.push(...list.getEntries().filter(e => e.startTime >= recording!.start).map(e => ({ start: e.startTime, duration: e.duration })));
    }).observe({ type: 'longtask', buffered: true });
  } catch { /* Long Tasks API is not available in every browser. */ }
  const api = {
    start(metadata: Metadata) { recording = { metadata, start: performance.now(), frames: [], longTasks: [] }; },
    stop() {
      if (!recording) throw new Error('Start a trace with named device, browser, preset, network, route and cache conditions first.');
      const trace = recording; recording = null;
      const sorted = [...trace.frames].sort((a, b) => a - b);
      const percentile = (p: number) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)] : null;
      const resources = performance.getEntriesByType('resource').map(e => {
        const r = e as PerformanceResourceTiming;
        return { url: r.name, startMs: r.startTime, durationMs: r.duration, transferBytes: r.transferSize, encodedBytes: r.encodedBodySize, decodedBytes: r.decodedBodySize };
      });
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const runtime = (window as unknown as { __neon?: { renderer: { getPixelRatio(): number; domElement: HTMLCanvasElement } } }).__neon;
      return { ...trace, durationMs: performance.now() - trace.start, usableDriveMs: usableAt, firstMovementMs: firstMoveAt,
        p50Ms: percentile(.5), p95Ms: percentile(.95), p99Ms: percentile(.99), samples: sorted.length,
        viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight, dpr: devicePixelRatio },
        rendering: runtime ? { dpr: runtime.renderer.getPixelRatio(), bufferWidth: runtime.renderer.domElement.width, bufferHeight: runtime.renderer.domElement.height } : null,
        memory: memory ? { usedBytes: memory.usedJSHeapSize, allocatedBytes: memory.totalJSHeapSize, limitBytes: memory.jsHeapSizeLimit } : null, resources,
        note: 'Transfer size 0 can mean cache or unavailable timing. Record waterfall/HAR and thermal/comfort observations separately.' };
    },
    download() {
      const blob = new Blob([JSON.stringify(api.stop(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = 'neon-performance.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };
  Object.defineProperty(window, '__nightPerf', { configurable: true, value: api });
}
