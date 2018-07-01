import { Node, Link, DataProvider } from '../index';

export const NODE_NUMBER = 50;
export const POSITION_RANGE = 100;

export interface GraphData {
    nodes: Node[];
    links: Link[];
}

export interface NodeData {
    label: string;
}

export class RandomDataProvider implements DataProvider {
    dataPromise: Promise<GraphData>;

    getNodes(): Promise<Node[]> {
        this.dataPromise = this.dataPromise || this.generateData();
        return this.dataPromise.then(data => {
            return data.nodes;
        });
    }

    getLinks(): Promise<Link[]> {
        this.dataPromise = this.dataPromise || this.generateData();
        return this.dataPromise.then(data => {
            return data.links;
        });
    }

    private generateData(): Promise<GraphData> {
        const data: GraphData = {
            nodes: [],
            links: [],
        };
        const linkMap = new Set<string>();

        for (let i = 0; i < NODE_NUMBER; i++) {
            data.nodes.push(new Node<NodeData>({
                types: i % 10 === 0 ? ['o3d-node-custome'] : ['o3d-node'],
                data: { label: 'Node ' + i },
                position: {
                    x: Math.random() * POSITION_RANGE - POSITION_RANGE / 2,
                    y: Math.random() * POSITION_RANGE,
                    z: Math.random() * POSITION_RANGE - POSITION_RANGE / 2,
                },
            }));
        }

        for (let i = 0; i < NODE_NUMBER; i++) {
            const sourceIndex = i;
            const targetIndex = Math.round(Math.random() * (data.nodes.length - 1));
            const key = `${sourceIndex}~${targetIndex}`;
            const key2 = `${targetIndex}~${sourceIndex}`;
            if (!linkMap.has(key) && !linkMap.has(key2) && sourceIndex !== targetIndex) {
                linkMap.add(key);
                data.links.push(new Link({
                    label: 'Link ' + i,
                    sourceId: data.nodes[sourceIndex].id,
                    targetId: data.nodes[targetIndex].id,
                }));
            }
        }

        return Promise.resolve(data);
    }
}
