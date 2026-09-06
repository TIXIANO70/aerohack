/**
 * @file diagram.js
 * @description Interacción con el diagrama SVG de corte transversal de infraestructura verde.
 */

const DEFAULT_ACTIVE_LAYER = 'garden';

export class LayerDiagram {
  constructor(containerEl) {
    if (!containerEl) return;

    this.container = containerEl;
    this.layers = containerEl.querySelectorAll('.diagram-layer');
    this.pickerButtons = containerEl.querySelectorAll('.layer-picker__btn');
    this.infoCards = containerEl.querySelectorAll('.layer-card');

    if (this.layers.length === 0) return;

    this.initEvents();
    this.activateLayer(DEFAULT_ACTIVE_LAYER);
  }

  /**
   * Vincula los clics tanto en los elementos SVG como en los botones selectores.
   */
  initEvents() {
    // Clics directos en grupos SVG
    this.layers.forEach((layer) => {
      layer.addEventListener('click', () => {
        const layerId = layer.dataset.layer;
        if (layerId) this.activateLayer(layerId);
      });
    });

    // Clics en la botonera de acceso rápido
    this.pickerButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const layerId = btn.dataset.layer;
        if (layerId) this.activateLayer(layerId);
      });
    });
  }

  /**
   * Activa una capa específica, actualizando estilos SVG y el panel descriptivo.
   * @param {string} layerId
   */
  activateLayer(layerId) {
    // 1. Resaltar capa SVG
    this.layers.forEach((layer) => {
      if (layer.dataset.layer === layerId) {
        layer.classList.add('is-active');
        layer.classList.remove('is-dimmed');
      } else {
        layer.classList.remove('is-active');
        layer.classList.add('is-dimmed');
      }
    });

    // 2. Actualizar estado de botones selectores
    this.pickerButtons.forEach((btn) => {
      if (btn.dataset.layer === layerId) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // 3. Mostrar la tarjeta informativa correspondiente
    this.infoCards.forEach((card) => {
      if (card.dataset.for === layerId) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });
  }
}

/**
 * Inicializador del componente de diagrama.
 */
export function initDiagram() {
  const diagramContainer = document.querySelector('.diagram-container');
  if (diagramContainer) {
    new LayerDiagram(diagramContainer);
  }
}
