/**
 * @file counters.js
 * @description Animación progresiva de contadores numéricos y reveal de elementos al hacer scroll.
 */

const COUNTER_ANIMATION_DURATION_MS = 1800;
const REVEAL_THRESHOLD = 0.15;

/**
 * Anima un elemento numérico desde 0 hasta su valor meta.
 * @param {HTMLElement} el - Elemento DOM con data-target
 */
function animateCounter(el) {
  const targetStr = el.dataset.target || '0';
  const targetValue = parseFloat(targetStr);
  const decimals = (targetStr.split('.')[1] || '').length;
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / COUNTER_ANIMATION_DURATION_MS, 1);
    
    // Función de easing easeOutExpo para frenada suave
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentValue = easeProgress * targetValue;

    if (decimals > 0) {
      // Reemplazar punto decimal por coma en español rioplatense
      el.textContent = currentValue.toFixed(decimals).replace('.', ',');
    } else {
      el.textContent = Math.round(currentValue).toString();
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = targetStr.replace('.', ',');
    }
  };

  requestAnimationFrame(update);
}

/**
 * Inicializa los observadores de scroll para reveals y contadores.
 */
export function initCountersAndReveals() {
  const revealElements = document.querySelectorAll('.reveal');
  const counterElements = document.querySelectorAll('.stat-number');

  // 1. Observer para elementos con animación de reveal
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: REVEAL_THRESHOLD }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // 2. Observer para contadores estadísticos
  if (counterElements.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counterElements.forEach((el) => counterObserver.observe(el));
  }
}
