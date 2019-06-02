import { Node, Link, Graph } from '../index';

export interface NodeData {
    label: string;
}

export function generateData(
    nodeNumber: number = 50,
    linkDublicationNumber: number = 1,
    positionRange: number = 100,
): Graph {
    const data: Graph = {
        nodes: [],
        links: [],
    };
    const linkMap = new Set<string>();

    for (let i = 0; i < nodeNumber; i++) {
        const randSizeK = 0.5 + Math.random() * 2;
        data.nodes.push(new Node<NodeData>({
            types: i % 10 === 0 ? ['o3d-node-custome'] : ['o3d-node'],
            data: { label: 'Node ' + i },
            position: {
                x: Math.random() * positionRange - positionRange / 2,
                y: Math.random() * positionRange,
                z: Math.random() * positionRange - positionRange / 2,
            },
            size: { x: 15 * randSizeK, y: 15 * randSizeK, z: 15 * randSizeK },
        }));
    }

    for (let i = 0; i < nodeNumber; i++) {
        const sourceIndex = i;
        const targetIndex = Math.round(Math.random() * (data.nodes.length - 1));
        const key = `${sourceIndex}~${targetIndex}`;
        if (!linkMap.has(key) && sourceIndex !== targetIndex) {
            linkMap.add(key);
            for (let j = 0; j < linkDublicationNumber; j++) {
                data.links.push(new Link({
                    label: `Link_${i}_${j}`,
                    sourceId: data.nodes[sourceIndex].id,
                    targetId: data.nodes[targetIndex].id,
                    types: [`Link_${j}`],
                }));
            }
        }
    }

    return data;
}
