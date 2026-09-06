/**
 * @file comparison-slider.js
 * @description Componente interactivo de comparación antes/después con soporte para mouse, touch y teclado.
 */

const DEFAULT_SPLIT_PERCENTAGE = 50;
const KEYBOARD_STEP_PERCENTAGE = 5;

export class ComparisonSlider {
  /**
   * @param {HTMLElement} containerEl - Contenedor principal .comparison-slider
   */
  constructor(containerEl) {
    if (!containerEl) return;

    this.container = containerEl;
    this.handle = containerEl.querySelector('.comparison-slider__handle');
    this.beforeBox = containerEl.querySelector('.comparison-slider__before');

    if (!this.handle || !this.beforeBox) return;

    this.isDragging = false;
    this.currentPercentage = DEFAULT_SPLIT_PERCENTAGE;

    this.initEvents();
    this.setPercentage(DEFAULT_SPLIT_PERCENTAGE);
  }

  /**
   * Registra los listeners de interacción unificada (mouse + touch + keyboard).
   */
  initEvents() {
    // Eventos de Mouse
    const onMouseDown = (e) => {
      this.isDragging = true;
      this.handlePointerMove(e.clientX);
    };

    const onMouseMove = (e) => {
      if (!this.isDragging) return;
      this.handlePointerMove(e.clientX);
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    this.container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Eventos Touch (Mobile & Tablets)
    const onTouchStart = (e) => {
      this.isDragging = true;
      if (e.touches.length > 0) {
        this.handlePointerMove(e.touches[0].clientX);
      }
    };

    const onTouchMove = (e) => {
      if (!this.isDragging || e.touches.length === 0) return;
      this.handlePointerMove(e.touches[0].clientX);
    };

    const onTouchEnd = () => {
      this.isDragging = false;
    };

    this.container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Accesibilidad por teclado (Flechas Izquierda / Derecha)
    this.container.setAttribute('tabindex', '0');
    this.container.setAttribute('role', 'slider');
    this.container.setAttribute('aria-label', 'Comparación visual antes y después de intervención urbana');
    this.container.setAttribute('aria-valuenow', String(DEFAULT_SPLIT_PERCENTAGE));
    this.container.setAttribute('aria-valuemin', '0');
    this.container.setAttribute('aria-valuemax', '100');

    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.setPercentage(this.currentPercentage - KEYBOARD_STEP_PERCENTAGE);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.setPercentage(this.currentPercentage + KEYBOARD_STEP_PERCENTAGE);
      }
    });
  }

  /**
   * Calcula el porcentaje según la posición absoluta X del puntero en la pantalla.
   * @param {number} clientX
   */
  handlePointerMove(clientX) {
    const rect = this.container.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(rect.width, offsetX));
    const percentage = (clampedX / rect.width) * 100;
    this.setPercentage(percentage);
  }

  /**
   * Aplica el porcentaje al clip-path y a la posición del divisor.
   * @param {number} percentage - Valor entre 0 y 100
   */
  setPercentage(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    this.currentPercentage = clamped;

    // clip-path: inset(top right bottom left)
    const rightInset = 100 - clamped;
    this.beforeBox.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
    this.handle.style.left = `${clamped}%`;
    this.container.setAttribute('aria-valuenow', Math.round(clamped).toString());
  }
}

/**
 * Función fábrica para inicializar todos los sliders en el documento.
 */
export function initComparisonSliders() {
  const sliders = document.querySelectorAll('.comparison-slider');
  sliders.forEach((sliderEl) => new ComparisonSlider(sliderEl));
}
