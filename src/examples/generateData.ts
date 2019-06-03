import { Graph } from '../index';

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
        data.nodes.push({
            id: `Node-${i}`,
            types: i % 10 === 0 ? ['o3d-node-custome'] : ['o3d-node'],
            data: { label: 'Node ' + i },
        });
    }

    for (let i = 0; i < nodeNumber; i++) {
        const sourceIndex = i;
        const targetIndex = Math.round(Math.random() * (data.nodes.length - 1));
        const key = `${sourceIndex}~${targetIndex}`;
        if (!linkMap.has(key) && sourceIndex !== targetIndex) {
            linkMap.add(key);
            for (let j = 0; j < linkDublicationNumber; j++) {
                data.links.push({
                    label: `Link_${i}_${j}`,
                    sourceId: data.nodes[sourceIndex].id,
                    targetId: data.nodes[targetIndex].id,
                    types: [`Link_${j}`],
                });
            }
        }
    }

    return data;
}
