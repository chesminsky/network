import * as d3 from 'd3';
import { simulateForce } from './force';
import { RADIUS } from './const';
import { mockData } from './mock';
import { Selection } from 'd3';
import { icons } from './icons';
import { MockedData } from './types';

export async function renderCanvas() {
    const canvas = <Selection<Element, any, HTMLElement, any>>d3.select('#canvas').classed('hidden', false);
    const width = Number(canvas.attr('width'));
    const height = Number(canvas.attr('height'));
    const ctx = (<HTMLCanvasElement>canvas.node()).getContext('2d');
    const data = mockData();
    const images = await Promise.all(preloadImages(data));
    const checkImg = new Image();
    checkImg.src = 'img/check_circle.svg';

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

        // if (d.x < 0 || d.x > width || d.y < 0 || d.y > d.height) {
        //     return;
        // }

        const icon = (d) => icons.find((icon) => icon.type === d.type);
        const i = icon(d);
        const img = images.find((item) => item.id === d.id).img;
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
        ctx.drawImage(checkImg,  d.x - txtWidth/2 - 20, d.y - i.height/2 - 23);
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


function preloadImages(data: MockedData): Array<Promise<{id: number; img: HTMLImageElement}>> {
    const promises = [];
    const icon = (d) => icons.find((icon) => icon.type === d.type);
    data.nodes.forEach((d) => {
        const i = icon(d);
        const img = new Image();
        img.src = i.url;

        const p = new Promise((res) => {
            img.onload = () => res({
                id: d.id,
                img
            });
        });

        promises.push(p);
    });

    return promises;
}