// import data from './data.json';
import * as d3 from 'd3';
import { SimulationLinkDatum, Selection } from 'd3';
import { mockData } from './mock';
import { MyNode } from './types';
import { icons } from './icons';

//const
const RADIUS = 20;
const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 1300 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

function renderSvg() {

    const data = mockData();

    // append the svg object to the body of the page
    const svg: Selection<Element, any, HTMLElement, any> = d3.select('#svg');

    svg.classed('hidden', false)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Initialize the links
    const link = g
        .selectAll('line')
        .data<SimulationLinkDatum<MyNode>>(data.links)
        .enter()
        .append('line')
        .style('stroke', '#388E3C')
        .style('stroke-width', '1.5px')

    const icon = (d) => icons.find((icon) => icon.type === d.type);
    // Initialize the nodes
    const node = g.selectAll('image')
        .data<MyNode>(data.nodes)
        .enter()
        .append('g');
    
    node.append('svg:image')
        .attr('xlink:href', (d) => {
            return  icon(d).url;
        })
        .attr('width', (d) => {
            return icon(d).width;
        })
        .attr('height', (d) => {
            return  icon(d).height;
        })
        .attr('transform', (d) => {
            return `translate(${-icon(d).height/2}, ${-icon(d).width/2})`
        });

    const text = node.append('text')
        .attr('y', (d) => -icon(d).height/2 - 8)
        .attr('text-anchor', 'middle')
        .text((d) => d.name);

    const textWidths = text.nodes().map((n) => n.getBBox().width);
    console.log(textWidths);

    node.append('svg:image')
        .attr('xlink:href', 'img/check_circle.svg')
        .attr('y', (d) => -icon(d).height/2 - 21)
        .attr('x', (d, i) => {
            return -textWidths[i]/2 - 20;
        })
        .attr('width', '16')
        .attr('height', '16');

        
    simulateForce(data, function () {
        link
            .attr('x1', (d) => {
                return (<MyNode>d.source).x;
            })
            .attr('y1', (d) => {
                return (<MyNode>d.source).y;
            })
            .attr('x2', (d) => {
                return (<MyNode>d.target).x;
            })
            .attr('y2', (d) => {
                return (<MyNode>d.target).y;
            });

        node
        .attr('transform', (d) => {
            return `translate(${d.x}, ${d.y})`
        });
    });

    d3.zoom().on('zoom', function () {
        g.attr('transform', d3.event.transform);
    })(svg);
}

function renderCanvas() {
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

function clear() {
    d3.select('#svg').html('').classed('hidden', true);
    d3.select('#canvas').html('').classed('hidden', true);
}

function render() {
    const type = (<HTMLInputElement>document.querySelector('[name="render"]:checked')).value;
    clear();
    type === 'svg' ? renderSvg() : renderCanvas();
}

function simulateForce(data, tickedFn) {
    const chargeForce = Number((<HTMLInputElement>document.querySelector('#strength')).value);
    const collideForce = Number((<HTMLInputElement>document.querySelector('#collide')).value);

    d3.forceSimulation<MyNode>(data.nodes)
        .force('link', d3.forceLink()
            .id((d: MyNode) => { return String(d.id); })
            .links(data.links)
        )
        .force('collide', d3.forceCollide(collideForce))
        .force('charge', d3.forceManyBody().strength(-chargeForce))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .on('tick', tickedFn);
}

render();

document.querySelector('#form').addEventListener('submit', (e) => {
    e.preventDefault();

    render();
});