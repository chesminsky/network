import * as d3 from 'd3';
import { simulateForce } from './force';
import { RADIUS } from './const';
import { mockData } from './mock';
import { Selection } from 'd3';

export function renderCanvas() {
    const canvas = <Selection<Element, any, HTMLElement, any>>d3.select('#canvas').classed('hidden', false);
    const width = Number(canvas.attr('width'));
    const height = Number(canvas.attr('height'));
    const ctx = (<HTMLCanvasElement>canvas.node()).getContext('2d');
    const data = mockData();

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();

        ctx.strokeStyle = '#aaa';
        data.links.forEach(drawLink);
        ctx.stroke();

        data.nodes.forEach(drawNode);
    }

    function drawNode(d) {
        ctx.beginPath();
        ctx.fillStyle = 'lightgreen';
        ctx.moveTo(d.x, d.y);
        ctx.arc(d.x, d.y, RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawLink(l) {
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
    }

    simulateForce(data, draw);

    d3.zoom().on('zoom', function () {
        const transform = d3.event.transform;
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);
        draw();
        ctx.restore();
    })(canvas);
}
