import * as d3 from 'd3';
import { mockData } from './mock';
import { Selection, SimulationLinkDatum } from 'd3';
import { width, height, margin } from "./const";
import { MyNode } from './types';
import { icons } from './icons';
import { simulateForce } from './force';

export function renderSvg() {

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
    
    node.append('rect')
        .lower()
        .attr('width', (d, i) => textWidths[i] + 20)
        .attr('height', 18)
        .attr('fill', 'white')
        .attr('y', (d) => -icon(d).height/2 - 21)
        .attr('x', (d, i) => {
            return -textWidths[i]/2 - 20;
        })

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