# Hardware performance record

The implementation supplies measurement tools; the real-device baseline is **pending**. Cloud Chromium timings do not satisfy R04. No phone adaptation was enabled or retuned without thermal evidence. Optional vehicle rigs no longer transfer four seconds after entry; the garage still loads its comparison fleet when opened. Radio uses streaming media with `preload="none"`.

Run a production preview with `?perf&nointro` (normal resolution and authored look). Use an empty cache and network shaping of 25 Mbps / 80 ms RTT for cold startup, then a separate normal-cache return. Record an integrated GPU laptop, desktop GPU, midrange Android, and supported iPhone/Safari. Record GPU, OS/browser versions, physical resolution, CSS viewport, rendering DPR, preset, and ambient/thermal conditions.

In DevTools, after warming the fixed First Fare route:

```js
__nightPerf.start({
  device: 'exact model / GPU / OS', browser: 'name and version',
  preset: 'Balanced; actual rendering DPR', network: '25 Mbps / 80 ms RTT',
  route: 'First Fare, same direction', cache: 'cold'
});
// Drive 120 seconds on desktop; 15 minutes on phones.
__nightPerf.download();
```

The JSON includes bounded raw frame samples, p50/p95/p99, long tasks, startup/first-movement marks, resource sizes/timing, viewport and memory where available. Sampling excludes paused frames; pause/return may add a resumption interval and must be annotated. Also save a browser trace and HAR for compressed first-play transfer, input correlations, compilation/first-use stalls and five-minute cold sessions. A zero resource transfer size is not proof of a zero-byte request.

| Device | Conditions / preset | Cold / warm usable drive | p95 / long tasks | 15-minute heat / comfort | Evidence |
| --- | --- | --- | --- | --- | --- |
| Integrated GPU laptop | Pending | Pending | Pending | n/a | Pending |
| Desktop GPU | Pending | Pending | Pending | n/a | Pending |
| Midrange Android | Pending | Pending | Pending | Pending | Pending |
| iPhone / Safari | Pending | Pending | Pending | Pending | Pending |

Targets remain those in [the plan](improvement-plan.md): 60 FPS goal / p95 ≤20 ms desktop, stable 30 FPS / p95 ≤33.3 ms phone; cold usable drive ≤15/20 seconds, warm ≤5 seconds. Do not infer a pass from build success or software-renderer runs. Record any missed target, cause and support restriction before release.
