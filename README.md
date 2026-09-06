# 🌱 Santa Rita Verde — Web de Presentación

Plataforma web de divulgación e impacto para el proyecto **Santa Rita Verde**, desarrollado por el **Equipo 2** en el marco del programa **AeroHack Joven** (Fundación Ciencia Joven, STEM Americas, PADF y Boeing).

La web presenta una experiencia narrativa interactiva (*scroll storytelling*) orientada tanto al panel de evaluación del certamen como a la comunidad de vecinos, instituciones y organismos públicos de la Ciudad de Buenos Aires.

---

## 🎯 Características Principales

1. **Narrativa Visual y Diagnóstico Territorial:**
   - Presentación del problema hidrológico crítico de Villa Santa Rita (apenas 0,01 m² de espacio verde por habitante frente a los 9 m² mínimos de la OMS).
   - Animación dinámica de contadores numéricos y métricas de absorción pluvial.

2. **Comparador Antes / Después (Street Transformation Slider):**
   - Comparación interactiva arrastrable (mouse, touch en pantallas móviles y flechas del teclado) entre una esquina real del barrio en su estado actual (asfalto impermeable, charcos y anegamiento) y su versión transformada con infraestructura verde urbana (terrazas vivas, veredas drenantes y canteros de biorretención).

3. **Diagrama Interactivo de Ingeniería Hidrológica:**
   - Corte transversal esquemático en SVG puro donde el usuario explora y activa las distintas capas del sistema (lluvia, terrazas verdes, veredas permeables, jardines de lluvia, cañería pluvial aliviada y recarga del acuífero freático).
   - Panel lateral con métricas de capacidad de retención y tiempos de desfase de pico.

4. **Cartografía Geoespacial con Leaflet.js:**
   - Mapa interactivo con tema oscuro (CartoDB Dark Matter) centrado en Villa Santa Rita (Comuna 11, CABA).
   - Marcadores de la cuadra testigo piloto y puntos críticos de anegamiento (Álvarez Jonte, Nazca, etc.).

5. **Timeline de Fases Design Thinking:**
   - Hoja de ruta vertical que documenta las 6 etapas metodológicas del proyecto (Empatizar, Definir, Idear, Prototipar, Testear y Comunicar).

6. **Triple Impacto y Convocatoria:**
   - Desglose de los pilares social, ambiental y económico del ODS 11 (Ciudades y Comunidades Sostenibles).

---

## 🏗️ Arquitectura Técnica y Clean Code

El proyecto fue desarrollado estrictamente bajo principios de **Clean Code**, sin frameworks pesados ni dependencias de compilación:

- **Estructura Modular (SRP):**
  - `css/styles.css`: Hojas de estilo estructuradas lógicamente (Design Tokens → Resets → Componentes → Secciones → Media Queries).
  - `js/main.js`: Orquestador y bootstrap (importación nativa de ES Modules).
  - `js/navbar.js`: Responsabilidad exclusiva sobre el scroll glassmorphism y menú responsive.
  - `js/counters.js`: Observadores de intersección y animación de métricas.
  - `js/comparison-slider.js`: Componente aislado de comparación antes/después con cálculo matemático desacoplado de posición y eventos touch/mouse unificados.
  - `js/diagram.js`: Control de capas SVG y conmutación de fichas informativas.
  - `js/map.js`: Lazy loading y renderizado de capas geoespaciales con Leaflet.
- **Cero Magic Numbers:** Todas las constantes de animación, umbrales de scroll y coordenadas están centralizadas en `SCREAMING_SNAKE_CASE`.
- **Programación Defensiva:** *Guard clauses* en cada inicializador para prevenir excepciones en consola si algún nodo DOM no existe.
- **Accesibilidad (a11y):** Roles semánticos ARIA, navegación por teclado y contraste de color optimizado.

---

## 🚀 Despliegue en GitHub Pages

Al tratarse de una web estática pura (HTML5, CSS3, ES Modules y assets locales), su publicación en **GitHub Pages** es directa:

1. Subir los cambios a la rama principal (`main` o `master`) de tu repositorio GitHub.
2. Ir a **Settings** > **Pages** en el repositorio.
3. En **Build and deployment** > **Source**, seleccionar **Deploy from a branch**.
4. Elegir la rama correspondiente y la carpeta raíz (`/` o `/aerohack`).
5. En unos segundos, el sitio estará disponible públicamente bajo `https://<usuario>.github.io/<repo>/`.

---

## 🧪 Pruebas Locales

Para levantar un servidor de pruebas en tu máquina local:

```bash
cd aerohack
python3 -m http.server 8080
```

Luego, abrir en el navegador `http://localhost:8080`.
