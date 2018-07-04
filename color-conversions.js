
const XYZ_TO_LINEAR_RGB_MATRIX = [
  3.2404542, -1.5371385, -0.4985314,
  -0.9692660, 1.8760108, 0.0415560,
  0.0556434, -0.2040259, 1.0572252
];

function xyY_to_XYZ([x,y,Y]) {
  let X = x*Y/y;
  let Z = (1-x-y)*Y/y;
  return [X,Y,Z];
}

function XYZ_to_linearRGB([X,Y,Z]) {
  return matrix_multiply_vector(XYZ_TO_LINEAR_RGB_MATRIX, [X,Y,Z]);
}

function linearRGB_to_linearrgb([R,G,B]) {
  let max = Math.max(R,G,B);
  return [ R/max, G/max, B/max ];
}

function linearC_to_gammaCorrectedC(c) {
  const a = 0.055;

  return c <= 0.0031308 ?
    12.92 * c :
    (1+a)*(Math.pow(c, 1/2.4)) - a
}

function linearrgb_to_gammaCorrectedrgb([lr,lg,lb]) {
  return [lr,lg,lb].map(linearC_to_gammaCorrectedC);
}

function xyY_to_scaledAndGammaCorrectedrgb(xyY) {
  let XYZ = xyY_to_XYZ(xyY);
  let RGB = XYZ_to_linearRGB(XYZ);
  if (RGB.some(i => i < 0)) { return [0,0,0]; }
  let rgb = linearRGB_to_linearrgb(RGB);
  let gamma_rgb = linearrgb_to_gammaCorrectedrgb(rgb);
  let scaled_rgb = gamma_rgb.map(i => Math.floor(i * 255));
  return scaled_rgb;
}

function matrix_multiply_vector([
  a, b, c,
  d, e, f,
  g, h, i
], [
  x,
  y,
  z
]) {
  return [
    a * x + b * y + c * z,
    d * x + e * y + f * z,
    g * x + h * y + i * z
  ];
}