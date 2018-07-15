import { GraphData } from '../models/graphModel';
import { Node } from '../models/node';
import { Link } from '../models/link';

export interface DataProvider {
    getData(): Promise<GraphData>;
}

export const NODE_NUMBER = 100;
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
                    y: Math.random() * POSITION_RANGE,
                    z: Math.random() * POSITION_RANGE - POSITION_RANGE / 2,
                }
            }));
        }

        for (let i = 0; i < NODE_NUMBER; i++) {
            const node = data.nodes[i];
            data.links.push(new Link({
                label: 'Link ' + i,
                source: node,
                target: data.nodes[Math.round(Math.random() * (data.nodes.length - 1))],
            }));
        }

        return Promise.resolve(data);
    }
}
