import times from 'lodash/times';
import { MockedData } from './types';
import { icons } from './icons';

// util
const randomStr = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const randInt = (max: number) => Math.floor(Math.random() * max);

export function mockData(): MockedData {
    const data = {
        nodes: [],
        links: []
    };

    const numberOfNodes = Number((<HTMLInputElement>document.querySelector('#nodes')).value);
    const numberOfLinks = Number((<HTMLInputElement>document.querySelector('#links')).value);
    const memo = {}

    times(numberOfNodes, (i) => {
        data.nodes.push({
            id: i,
            name: randomStr()
        });

        const linksOfNode = randInt(numberOfLinks);

        times(linksOfNode, () => {

            const targetId = randInt(numberOfNodes);

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

    data.nodes.forEach((n) => {
        if (memo[n.id] <= 2) {
            n.type = 'port';
            if (n.id % 5 === 0) {
                n.type = 'port_error'
            }
        } else {
            n.type = 'router_blue';
            if (n.id % 5 === 0) {
                n.type = icons[randInt(icons.length - 2)].type
            }
        }
    });
    console.log(memo);
    return data;
}