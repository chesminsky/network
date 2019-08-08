// import data from './data.json';
import * as d3 from 'd3';
import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';
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

    const noLinks = [];

    times(opts.numberOfNodes, (i) => {
        data.nodes.push({
            id: i,
            name: randomStr()
        });

        const linksOfNode = randInt(opts.numberOfLinks);

        if (!linksOfNode) {
            noLinks.push(i);
        } else {
            times(linksOfNode, () => {

                const targetId = randInt(opts.numberOfNodes);

                if (!noLinks.includes(targetId)) {
                    data.links.push({
                        source: i,
                        target: targetId
                    });
                }
            });
        }
    });

    return data;
}

function renderSvg() {

    const data = mockData();

    // append the svg object to the body of the page
    const svg = d3.select('#svg')
        .classed('hidden', false)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

    // Initialize the links
    const link = svg
        .selectAll('line')
        .data<SimulationLinkDatum<MyNode>>(data.links)
        .enter()
        .append('line')
        .style('stroke', '#aaa')

    // Initialize the nodes
    const node = svg
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
}

function renderCanvas() {
    const canvas = <any>d3.select('#canvas').classed('hidden', false);
    const width = canvas.attr('width');
    const height = canvas.attr('height');
    const ctx = (<HTMLCanvasElement>canvas.node()).getContext('2d');
    const data = mockData();

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

    simulateForce(data, function() {
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();

        ctx.strokeStyle = '#aaa';
        data.links.forEach(drawLink);
        ctx.stroke();

        data.nodes.forEach(drawNode);
    });
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
    const chargeStr = Number((<HTMLInputElement>document.querySelector('#strength')).value);

    d3.forceSimulation<MyNode>(data.nodes)
        .force('link', d3.forceLink()
            .id((d: MyNode) => { return String(d.id); })
            .links(data.links)
        )
        .force('collide', d3.forceCollide(RADIUS * 2))
        .force('charge', d3.forceManyBody().strength(-chargeStr))
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
