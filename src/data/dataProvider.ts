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

        // data.nodes.push(new Node({ label: '1' }));
        // data.nodes.push(new Node({ label: '2' }));
        // data.nodes.push(new Node({ label: '3' }));
        // data.nodes.push(new Node({ label: '4' }));
        // data.nodes.push(new Node({ label: '5' }));

        // data.nodes.push(new Node({ label: '1-1' })); // 5
        // data.nodes.push(new Node({ label: '2-1' })); // 6

        // data.nodes.push(new Node({ label: '1-2' })); // 7
        // data.nodes.push(new Node({ label: '2-2' })); // 8

        // data.links.push(new Link({ label: '1', source: data.nodes[0], target: data.nodes[1] }));
        // data.links.push(new Link({ label: '2', source: data.nodes[1], target: data.nodes[2] }));
        // data.links.push(new Link({ label: '3', source: data.nodes[2], target: data.nodes[3] }));
        // data.links.push(new Link({ label: '4', source: data.nodes[3], target: data.nodes[4] }));
        // data.links.push(new Link({ label: '5', source: data.nodes[4], target: data.nodes[0] }));

        // data.links.push(new Link({ label: '1-1', source: data.nodes[4], target: data.nodes[5] }));
        // data.links.push(new Link({ label: '2-1', source: data.nodes[5], target: data.nodes[6] }));
        // data.links.push(new Link({ label: '3-1', source: data.nodes[6], target: data.nodes[0] }));

        // data.links.push(new Link({ label: '1-2', source: data.nodes[2], target: data.nodes[7] }));
        // data.links.push(new Link({ label: '2-2', source: data.nodes[7], target: data.nodes[8] }));
        // data.links.push(new Link({ label: '3-2', source: data.nodes[8], target: data.nodes[3] }));

        return Promise.resolve(data);
    }
}
