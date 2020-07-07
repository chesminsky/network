const q = document.querySelector.bind(document);
const c = type => document.createElementNS('http://www.w3.org/2000/svg', type);

const makeLine = (...coords) => {
    const line = c('line');
    line.setAttribute('x1', coords[0]);
    line.setAttribute('x2', coords[1]);
    line.setAttribute('y1', coords[2]);
    line.setAttribute('y2', coords[3]);
    line.setAttribute('stroke', 'black');
    return line;
}

const makeCircle = (...coords) => {
    const circle = c('circle');
    circle.setAttribute('cx', coords[0]);
    circle.setAttribute('cy', coords[1]);
    circle.setAttribute('r', 5);
    circle.setAttribute('fill', 'red');
    return circle;
}

const appendAll = (container, ...elems) => {
    elems.forEach(e => container.appendChild(e)); 
} 

const logAll = (...vars) => {
    vars.forEach(v => console.log(v, eval(v)));
}

// --------- 

const hypD = (...p) => Math.sqrt(Math.pow(p[1] - p[0], 2) + Math.pow(p[3] - p[2], 2));
const hypL = (...l) => Math.sqrt(Math.pow(l[0], 2) + Math.pow(l[1], 2));

const x1 = 50, y1 = 400, x3 = 500, y3 = 250, h = 30, K = 0.3;
const mx = (x3 - x1) / 2 + x1;
const my = (y3 - y1) / 2 + y1;
const s = hypD(x1, x3, y1, y3) / 2;
const alpha = Math.atan((y1 - y3) / (x3 - x1));
const alphaDeg = alpha * 180 / Math.PI;
const betta = Math.atan(h / s);
const bettaDeg = betta * 180 / Math.PI;
const gamma = alpha + betta;
const l = hypL(s, h);
const x2 =  l * Math.cos(gamma) + x1;
const y2 = y1 - l * Math.sin(gamma);

const delta = Math.atan(2 * h / s);
const cx1 = K * s * Math.cos(alpha + delta) + x1;
const cx2 = (1 - K) * s * Math.cos(alpha) + x1;
const cy1 = y1 - K * s * Math.sin(alpha + delta);
const cy2 = y2 + K * s * Math.sin(alpha);

logAll('x1', 'y1', 'x3', 'y3', 'mx', 'my', 's', 'l', 'alphaDeg', 'bettaDeg', 'x2', 'y2', 'cx1', 'cx2', 'cy1', 'cy2');

// --------

const line = makeLine(x1, x3, y1, y3);
const lineH = makeLine(mx, x2, my, y2);
const c1 = makeCircle(x1, y1);
const c3 = makeCircle(x3, y3);
const cm = makeCircle(mx, my);
const cc1 = makeCircle(cx1, cy1);
const cc2 = makeCircle(cx2, cy2);

const svg = q('#svg');

appendAll(svg, line, lineH, c1, c3, cm, cc1, cc2);