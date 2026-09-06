/**
 * @file main.js
 * @description Orquestador principal y punto de entrada (bootstrap) de Santa Rita Verde Web.
 */

import { initNavbar } from './navbar.js';
import { initCountersAndReveals } from './counters.js';
import { initComparisonSliders } from './comparison-slider.js';
import { initDiagram } from './diagram.js';
import { initMap } from './map.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    initNavbar();
    initCountersAndReveals();
    initComparisonSliders();
    initDiagram();
    initMap();
  } catch (error) {
    console.error('Error durante la inicialización de módulos en Santa Rita Verde:', error);
  }
});
