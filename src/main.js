import { initRouter } from './routes/router.js';
import './tampilan.css';

document.addEventListener('DOMContentLoaded', () => {
  initRouter(); 
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((reg) => console.log('SW registered: ', reg.scope))
      .catch((err) => console.error('SW registration failed: ', err));
  });
}
