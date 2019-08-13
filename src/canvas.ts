import * as d3 from 'd3';
import { simulateForce } from './force';
import { RADIUS } from './const';
import { mockData } from './mock';
import { Selection } from 'd3';
import { icons } from './icons';

export function renderCanvas() {
    const canvas = <Selection<Element, any, HTMLElement, any>>d3.select('#canvas').classed('hidden', false);
    const width = Number(canvas.attr('width'));
    const height = Number(canvas.attr('height'));
    const ctx = (<HTMLCanvasElement>canvas.node()).getContext('2d');
    const data = mockData();
    let transform;

    function draw() {
        if (transform) {
            ctx.save();
        }
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        if (transform) {
            ctx.translate(transform.x, transform.y);
            ctx.scale(transform.k, transform.k);
        }

        data.links.forEach(drawLink);
        data.nodes.forEach(drawNode);
        if (transform) {
            ctx.restore();
        }
    }

    function drawNode(d) {

        const icon = (d) => icons.find((icon) => icon.type === d.type);
        const i = icon(d);
        const img = new Image();
        img.src = i.url;
        ctx.drawImage(img, d.x - i.width/2, d.y - i.height/2);

        ctx.font = '14px Arial';
        const txtWidth = ctx.measureText(d.name).width;

        // white bg
        ctx.fillStyle = 'white';
        ctx.fillRect(d.x - txtWidth/2 - 20, d.y - i.height/2 - 22, txtWidth + 25, 17);

        // name
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(d.name, d.x + 5, d.y - i.height/2 - 8);

        // check
        const check = new Image();
        check.src = 'img/check_circle.svg';
        ctx.drawImage(check,  d.x - txtWidth/2 - 20, d.y - i.height/2 - 23);
    }

    function drawLink(l) {
        ctx.strokeStyle = '#aaa';
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.stroke();
    }

    simulateForce(data, draw);

    d3.zoom().on('zoom', function () {
        transform = d3.event.transform;
        draw();
    })(canvas);
}
