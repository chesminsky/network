import { SimulationNodeDatum } from "d3";

export interface MyNode extends SimulationNodeDatum {
    id: number;
    name: string;
    type: string;
}

export type MockedData = { nodes: MyNode[], links: Array<{ source: number; target: number }> };