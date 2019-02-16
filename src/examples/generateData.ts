import { Node, Link, GraphElements } from '../index';

export interface NodeData {
    label: string;
}

export function generateData(nodeNumber: number = 50, positionRange: number = 100): GraphElements {
    const data: GraphElements = {
        nodes: [],
        links: [],
    };
    const linkMap = new Set<string>();

    for (let i = 0; i < nodeNumber; i++) {
        data.nodes.push(new Node<NodeData>({
            types: i % 10 === 0 ? ['o3d-node-custome'] : ['o3d-node'],
            data: { label: 'Node ' + i },
            position: {
                x: Math.random() * positionRange - positionRange / 2,
                y: Math.random() * positionRange,
                z: Math.random() * positionRange - positionRange / 2,
            },
        }));
    }

    for (let i = 0; i < nodeNumber; i++) {
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

    return data;
}
