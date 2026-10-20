import './styles/index.css';
import './styles/trapnest.css';
import { bootstrapExperience } from './app/bootstrap';
import { createLoaderOverlay } from './ui/loader/createLoaderOverlay';
import './styles/night.css';
import { installSessionRecorder } from './debug/sessionRecord';
import { installModalBoundary } from './ui/core/modalBoundary';
import { showRecovery } from './runtime/recovery';
import { isMobileDevice } from './platform/deviceLayout';
document.documentElement.classList.toggle('device-mobile', isMobileDevice());
installModalBoundary();
installSessionRecorder();
const loader = createLoaderOverlay();
bootstrapExperience(loader).then(experience => {
  if (import.meta.env.DEV || new URLSearchParams(location.search).has('debug')) {
    Object.defineProperty(window, '__neon', {
      configurable: true,
      value: experience
    });
  }
}).catch((error: unknown) => {
  console.error('[Trapnest Neon] Initialization failed:', error);
  loader.fail(error);
  showRecovery(error);
});

// GPU pipelines and AudioWorklets hold native state. Vite updates ordinary modules
// and styles; changes to the application root restart the experience cleanly.
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
  import.meta.hot.dispose(() => {
    document.querySelectorAll('canvas').forEach(canvas => canvas.remove());
  });
}
