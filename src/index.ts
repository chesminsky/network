import data from './data.json';
import * as d3 from "d3";
import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

interface MyNode extends SimulationNodeDatum {
    id: number;
    name: string;
}

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select('#my_dataviz')
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
    .attr('r', 20)
    .style('fill', '#69b3a2')

// Let's list the force we wanna apply on the network
d3.forceSimulation<MyNode>(data.nodes)                // Force algorithm is applied to data.nodes
    .force('link', d3.forceLink()                               // This force provides links between nodes
        .id((d: MyNode) => { return String(d.id); })                     // This provide  the id of a node
        .links(data.links)                                    // and this the list of links
    )
    .force('charge', d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force('center', d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
    .on('tick', ticked);

// This function is run at each iteration of the force algorithm, updating the nodes position.
function ticked() {
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
            return d.x + 6;
        })
        .attr('cy', (d) => {
            return d.y - 6;
        });
}

