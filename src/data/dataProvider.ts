import { GraphData } from '../model/graphModel';
import { Node } from '../model/node';
import { Link } from '../model/link';

export interface DataProvider {
    getData(): Promise<GraphData>;
}

export const NODE_NUMBER = 10;
export const LINK_NUMBER = 10;
export const POSITION_RANGE = 100;

export class RandomDataProvider implements DataProvider {
    getData(): Promise<GraphData> {
        const data: GraphData = {
            nodes: [],
            links: [],
        };

        for (let i = 0; i < NODE_NUMBER; i++) {
            data.nodes.push(new Node({
                label: 'Node ' + i,
                position: {
                    x: Math.random() * POSITION_RANGE - POSITION_RANGE / 2,
                    y: Math.random() * POSITION_RANGE - POSITION_RANGE / 2,
                    z: Math.random() * POSITION_RANGE - POSITION_RANGE / 2,
                }
            }));
        }

        for (let i = 0; i < LINK_NUMBER; i++) {
            data.links.push(new Link({
                label: 'Link ' + i,
                source: data.nodes[Math.round(Math.random() * (data.nodes.length - 1))],
                target: data.nodes[Math.round(Math.random() * (data.nodes.length - 1))],
            }));
        }

        return Promise.resolve(data);
    }
}
