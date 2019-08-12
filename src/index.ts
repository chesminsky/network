import * as d3 from 'd3';
import { renderSvg } from './svg';
import { renderCanvas } from './canvas';

function clear() {
    d3.select('#svg').html('').classed('hidden', true);
    d3.select('#canvas').html('').classed('hidden', true);
}

function render() {
    const type = (<HTMLInputElement>document.querySelector('[name="render"]:checked')).value;
    clear();
    type === 'svg' ? renderSvg() : renderCanvas();
}

render();

document.querySelector('#form').addEventListener('submit', (e) => {
    e.preventDefault();

    render();
});