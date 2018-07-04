if (document.readyState === 'complete') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

function init() {
  let button = document.getElementById('drawChromaticityDiagram');
  button.onclick = () => {
    let cd = new ChromaticityDiagram(document.getElementById('chromaticityDiagram'));
    cd.render();
  }
  let swatch = Swatch.byId('1');
  for (let inputsDiv of document.querySelectorAll('[data-type="rgb-inputs"]')) {
    let rgbInput = new RGBInputCollection(inputsDiv);
    swatch.setColor(rgbInput.rgb);
    rgbInput.onChange(() => { swatch.setColor(rgbInput.rgb); })
  }

  for (let inputsDiv of document.querySelectorAll('[data-type="xyY-inputs"]')) {
    let inputCollection = new xyYInputcollection(inputsDiv);
    inputCollection.onChange(() => {
      let results = {};
      results.xyY = inputCollection.xyY;
      results.XYZ = xyY_to_XYZ(results.xyY);
      results.RGB = XYZ_to_linearRGB(results.XYZ);
      results.rgb = linearRGB_to_linearrgb(results.RGB);
      results.gamma_rgb = linearrgb_to_gammaCorrectedrgb(results.rgb);
      let scaled_rgb = results.gamma_rgb.map(i => i * 255);
      swatch.setColor(scaled_rgb);
      console.log(inputCollection.xyY, results);
    })
  }
}
class InputCollection {
  constructor(el) {
    if (!el) { throw new Error('Needed el for initRGBInput'); }
    this.el = el;
    this.data = {};
    this.listeners = [];
    this.initInputs();
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  didChange() {
    for (let fn of this.listeners) { fn(); }
  }

  initInputs() {
    for (let input of this.el.querySelectorAll('input[data-type]')) {
      let type = input.getAttribute('data-type');
      this.data[type] = parseFloat(input.value);
      input.addEventListener('input', () => {
        let value = parseFloat(input.value);
        this.data[type] = value;
        this.didChange();
      });
    }
  }
}

class RGBInputCollection extends InputCollection {
  get rgb() {
    return [ this.data.r,this.data.g,this.data.b ];
  }
}

class xyYInputcollection extends InputCollection {
  get xyY() {
    return [
      this.data.x,this.data.y,this.data.Y
    ];
  }
}
class Swatch {
  static byId(id) {
    let el = document.querySelector(`[data-type="swatch"][data-id="${id}"]`);
    if (!el) { throw new Error('No swatch id found for',id); }
    return new Swatch(el);
  }

  constructor(el) {
    if (!el) { throw new Error('Needed el for Swatch'); }
    this.el = el;
  }

  setColor([r,g,b]) {
    this.el.style.backgroundColor = `rgb(${r},${g},${b})`;
  }
}

class ChromaticityDiagram {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = parseInt(this.canvas.getAttribute('width'));
    this.height = parseInt(this.canvas.getAttribute('height'));
  }

  render() {
    let imageData = this.ctx.createImageData(this.width, this.height);
    let canvasX = 0;
    let canvasY = 0;

    let Y = 1.0;
    let alpha = 255;

    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      let x = canvasX/this.width;
      let y = (this.height - canvasY)/this.height;
      let [r,g,b] = xyY_to_scaledAndGammaCorrectedrgb([x,y,Y]);
      data[i] = r;
      data[i+1] = g;
      data[i+2] = b;
      data[i+3] = alpha;

      canvasX = canvasX + 1;
      if (canvasX >= this.width) {
        canvasY = canvasY + 1;
        canvasX = 0;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }
}