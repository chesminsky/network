// import data from './data.json';
import * as d3 from 'd3';
import { SimulationNodeDatum, SimulationLinkDatum, Selection } from 'd3';
import times from 'lodash/times';

interface MyNode extends SimulationNodeDatum {
    id: number;
    name: string;
}

type MockedData = { nodes: MyNode[], links: Array<{ source: number; target: number }> };
type MockDataOptions = { numberOfNodes: number; numberOfLinks: number };

// util
const randomStr = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const randInt = (max: number) => Math.floor(Math.random() * max);

//const
const RADIUS = 20;

function mockData(): MockedData {
    const data = {
        nodes: [],
        links: []
    };

    const opts = getFormData();
    const memo = {}

    times(opts.numberOfNodes, (i) => {
        data.nodes.push({
            id: i,
            name: randomStr()
        });

        const linksOfNode = randInt(opts.numberOfLinks);

        times(linksOfNode, () => {

            const targetId = randInt(opts.numberOfNodes);

            if (!memo[targetId]) {
                memo[targetId] = 0;
            }
            memo[targetId]+= 1;

            if (memo[targetId] <= linksOfNode) {
                data.links.push({
                    source: i,
                    target: targetId
                });
            }
        });
    });
    console.log(memo);
    return data;
}

function renderSvg() {

    const data = mockData();

    // append the svg object to the body of the page
    const svg: Selection<Element, any, HTMLElement, any> = d3.select('#svg');

    svg.classed('hidden', false)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
        .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

    // Initialize the links
    const link = g
        .selectAll('line')
        .data<SimulationLinkDatum<MyNode>>(data.links)
        .enter()
        .append('line')
        .style('stroke', '#aaa')

    // Initialize the nodes
    const node = g
        .selectAll('circle')
        .data<MyNode>(data.nodes)
        .enter()
        .append('circle')
        .attr('r', RADIUS)
        .style('fill', 'lightcoral')

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
            .attr('cx', (d) => {
                return d.x;
            })
            .attr('cy', (d) => {
                return d.y;
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

function getFormData(): MockDataOptions {
    return {
        numberOfNodes: Number((<HTMLInputElement>document.querySelector('#nodes')).value),
        numberOfLinks: Number((<HTMLInputElement>document.querySelector('#links')).value)
    }
}

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 1300 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

render();

document.querySelector('#form').addEventListener('submit', (e) => {
    e.preventDefault();

    render();
});