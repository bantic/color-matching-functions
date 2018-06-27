console.log('hi',document.readyState);
if (document.readyState === 'complete') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

function init() {
  initSliders();
}

const MIN_VISIBLE_LIGHT_WAVELENGTH = 400; // nm
const MAX_VISIBLE_LIGHT_WAVELENGTH = 700; // nm

function initSliders() {
  for (let lightSelector of document.querySelectorAll('.light-selector')) {
    new WavelengthSlider(lightSelector);
  }
}

class WavelengthSlider {
  constructor(lightSelectorEl) {
    this.el = lightSelectorEl;
    this.rangeInput = this.el.querySelector('.light-selector--slider');
    this.displayInput = this.el.querySelector('.light-selector--display');

    let swatchId = this.el.getAttribute('data-swatch-id');
    this.swatch = new Swatch(document.querySelector(`.swatch[data-id="${swatchId}"]`));

    this.setupRangeInput();
    this.addChangeListener();
    this.update();
  }

  setupRangeInput() {
    this.rangeInput.setAttribute('min', MIN_VISIBLE_LIGHT_WAVELENGTH);
    this.rangeInput.setAttribute('max', MAX_VISIBLE_LIGHT_WAVELENGTH);
    this.rangeInput.setAttribute('step', 10);
  }

  addChangeListener() {
    this.rangeInput.addEventListener('input', () => this.update());
  }

  update() {
    let value = this.rangeInput.value;
    this.displayInput.value = value;

    this.swatch.setColor( new Light(value).toRGB() );
  }
}

class Light {
  constructor(nm) {
    this.wavelength = nm;
  }

  toRGB() {
    let r = 255*(this.wavelength - MIN_VISIBLE_LIGHT_WAVELENGTH) / (MAX_VISIBLE_LIGHT_WAVELENGTH - MIN_VISIBLE_LIGHT_WAVELENGTH);
    let g = 255 - r;
    let b = 0;
    return [r,g,b];
  }
}

class Swatch {
  constructor(el) {
    this.el = el;
  }

  setColor([r,g,b]) {
    this.el.style.backgroundColor = `rgb(${r},${g},${b})`;
  }
}