import * as d3 from 'd3';
import { mockData } from './mock';
import { Selection, SimulationLinkDatum } from 'd3';
import { width, height, margin } from './const';
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

	const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Initialize the links
	const link = g
		.selectAll('line')
		.data<SimulationLinkDatum<MyNode>>(data.links)
		.enter()
		.append('line')
		.style('stroke', '#388E3C')
		.style('stroke-width', '1.5px');

	// ------- arcs -------

	const makePath = (startX, startY, endX, endY, cx1, cy1, cx2, cy2) => {
		return `M${startX},${startY} C${cx1},${cy1} ${cx2},${cy2} ${endX},${endY}`;
	};

	const hypD = (...p) => Math.sqrt(Math.pow(p[1] - p[0], 2) + Math.pow(p[3] - p[2], 2));
	const hypL = (...l) => Math.sqrt(Math.pow(l[0], 2) + Math.pow(l[1], 2));

	const createArc = (x1, x2, y1, y2, h) => {
		const K = 0.3;
		const s = hypD(x1, x2, y1, y2) / 2;
		const alpha = Math.atan((y1 - y2) / (x2 - x1));
		const beta = Math.atan(h / s);
		const l = hypL(s, h);
		const mhx = l * Math.cos(alpha + beta) + x1;
		const mhy = y1 - l * Math.sin(alpha + beta);

		const cx1 = K * l * Math.cos(alpha + 2 * beta) + x1;
		const cx2 = mhx - K * l * Math.cos(alpha);
		const cy1 = y1 - K * l * Math.sin(alpha + 2 * beta);
		const cy2 = mhy + K * l * Math.sin(alpha);
		return makePath(x1, y1, mhx, mhy, cx1, cy1, cx2, cy2);
	};

	const arc = g
		.selectAll('path')
		.data<SimulationLinkDatum<MyNode>>(data.links)
		.enter()
		.append('path');

	// --------------------

	const icon = (d) => icons.find((icon) => icon.type === d.type);
	// Initialize the nodes
	const node = g.selectAll('image').data<MyNode>(data.nodes).enter().append('g');

	node.append('svg:image')
		.attr('xlink:href', (d) => {
			return icon(d).url;
		})
		.attr('width', (d) => {
			return icon(d).width;
		})
		.attr('height', (d) => {
			return icon(d).height;
		})
		.attr('transform', (d) => {
			return `translate(${-icon(d).height / 2}, ${-icon(d).width / 2})`;
		});

	const text = node
		.append('text')
		.attr('y', (d) => -icon(d).height / 2 - 8)
		.attr('text-anchor', 'middle')
		.text((d) => d.name);

	const textWidths = text.nodes().map((n) => n.getBBox().width);

	node.append('rect')
		.lower()
		.attr('width', (d, i) => textWidths[i] + 20)
		.attr('height', 18)
		.attr('fill', 'white')
		.attr('y', (d) => -icon(d).height / 2 - 21)
		.attr('x', (d, i) => {
			return -textWidths[i] / 2 - 20;
		});

	node.append('svg:image')
		.attr('xlink:href', 'img/check_circle.svg')
		.attr('y', (d) => -icon(d).height / 2 - 21)
		.attr('x', (d, i) => {
			return -textWidths[i] / 2 - 20;
		})
		.attr('width', '16')
		.attr('height', '16');

	const simulation = simulateForce(data, function () {
		link.attr('x1', (d) => {
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

		arc.attr('d', (d) => {
			return createArc(
				(<MyNode>d.source).x,
				(<MyNode>d.target).x,
				(<MyNode>d.source).y,
				(<MyNode>d.target).y,
				20
			);
		});

		node.attr('transform', (d) => {
			return `translate(${d.x}, ${d.y})`;
		});
	});

	d3.zoom().on('zoom', function () {
		g.attr('transform', d3.event.transform);
	})(svg);

	d3
		.drag()
		.on('start', (d: MyNode) => {
			if (!d3.event.active) {
				simulation.alphaTarget(0.01).restart();
			}
			d.fx = d.x;
			d.fy = d.y;
		})
		.on('drag', (d: MyNode) => {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		})
		.on('end', (d: MyNode) => {
			if (!d3.event.active) {
				simulation.alphaTarget(0);
			}
			d.fx = null;
			d.fy = null;
		})(node);
}
