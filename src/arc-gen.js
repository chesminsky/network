const q = document.querySelector.bind(document);
const c = (type) => document.createElementNS('http://www.w3.org/2000/svg', type);

const makeLine = (...coords) => {
	const line = c('line');
	line.setAttribute('x1', coords[0]);
	line.setAttribute('x2', coords[1]);
	line.setAttribute('y1', coords[2]);
	line.setAttribute('y2', coords[3]);
	line.setAttribute('stroke', 'black');
	return line;
};

const makeCircle = (...coords) => {
	const circle = c('circle');
	circle.setAttribute('cx', coords[0]);
	circle.setAttribute('cy', coords[1]);
	circle.setAttribute('r', 5);
	circle.setAttribute('fill', 'red');
	return circle;
};

const makePath = (startX, startY, endX, endY, cx1, cy1, cx2, cy2) => {
	const path = c('path');
	path.setAttribute('d', `M${startX},${startY} C${cx1},${cy1} ${cx2},${cy2} ${endX},${endY}`);
	return path;
};

const appendAll = (container, ...elems) => {
	elems.forEach((e) => container.appendChild(e));
};

// ---------

const hypD = (...p) => Math.sqrt(Math.pow(p[1] - p[0], 2) + Math.pow(p[3] - p[2], 2));
const hypL = (...l) => Math.sqrt(Math.pow(l[0], 2) + Math.pow(l[1], 2));
const toDeg = (rad) => rad * 180 / Math.PI;

const createArc = (x1, x2, y1, y2, h, name) => {
	const logAll = (...vars) => {
		console.log(name);
		vars.forEach((v) => console.log(v, eval(v)));
	};

	const K = 0.3;
	const mx = (x2 - x1) / 2 + x1;
	const my = (y2 - y1) / 2 + y1;
	const s = hypD(x1, x2, y1, y2) / 2;
	const alpha = Math.atan((y1 - y2) / (x2 - x1));
    const beta = Math.atan(h / s);
    const alphaD = toDeg(alpha);
    const betaD = toDeg(beta);
    const l = hypL(s, h);
    const i = x1 > x2 ? -1 : 1;
    const i2 = y1 > y2 ? -1 : 1;
    const dx = x1 > x2 ? x2 : x1;
    const dy = y1 > y2 ? y2 : y1;
	const mhx = l * Math.cos(alpha + beta) + x1;
	const mhy = y1 - l * Math.sin(alpha + beta);

	const cx1 = K * l * Math.cos(alpha + 2 * beta) + x1;
	const cx2 = mhx - K * l * Math.cos(alpha);
	const cy1 = y1 - K * l * Math.sin(alpha + 2 * beta);
	const cy2 = mhy + K * l * Math.sin(alpha);

	logAll('x1', 'y1', 'x2', 'y2', 'alphaD', 'betaD', 'mx', 'my', 's', 'l', 'mhx', 'mhy', 'cx1', 'cx2', 'cy1', 'cy2');

	const line = makeLine(x1, x2, y1, y2);
	const lineH = makeLine(mx, mhx, my, mhy);
	const c1 = makeCircle(x1, y1);
	const c2 = makeCircle(mhx, mhy);
	const c3 = makeCircle(x2, y2);
	const cm = makeCircle(mx, my);
	const cc1 = makeCircle(cx1, cy1);
	const cc2 = makeCircle(cx2, cy2);
	const path = makePath(x1, y1, mhx, mhy, cx1, cy1, cx2, cy2);

	const svg = q('#svg');

	appendAll(svg, line, lineH, c1, c2, c3, cm, cc1, cc2, path);
};

// ---

createArc(100, 400, 100, 120, 40, 'hor');
createArc(400, 100, 300, 280, 40, 'horInv');
createArc(100, 400, 400, 380, 40, 'hor');
createArc(400, 100, 480, 500, 40, 'horInv');

createArc(720, 700, 200, 600, 40, 'ver');
createArc(800, 820, 600, 200, 40, 'verInv');
createArc(900, 920, 200, 600, 40, 'ver');
createArc(1020, 1000, 600, 200, 40, 'verInv');

createArc(100, 400, 100, 120, -40, 'hor');
createArc(400, 100, 300, 280, -40, 'horInv');
createArc(100, 400, 400, 380, -40, 'hor');
createArc(400, 100, 480, 500, -40, 'horInv');

createArc(720, 700, 200, 600, -40, 'ver');
createArc(800, 820, 600, 200, -40, 'verInv');
createArc(900, 920, 200, 600, -40, 'ver');
createArc(1020, 1000, 600, 200, -40, 'verInv');
