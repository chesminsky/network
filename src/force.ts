import { MyNode } from './types';
import * as d3 from 'd3';
import { width, height } from './const';

export function simulateForce(data, tickedFn) {
    const chargeForce = Number((<HTMLInputElement>document.querySelector('#strength')).value);
    const collideForce = Number((<HTMLInputElement>document.querySelector('#collide')).value);

    return d3.forceSimulation<MyNode>(data.nodes)
        .force('link', d3.forceLink()
            .id((d: MyNode) => { return String(d.id); })
            .links(data.links)
        )
        .force('collide', d3.forceCollide(collideForce))
        .force('charge', d3.forceManyBody().strength(-chargeForce))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .on('tick', tickedFn);
}