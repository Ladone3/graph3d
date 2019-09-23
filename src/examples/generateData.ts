import { LinkModel, NodeDefinition } from '../index';

export interface NodeData {
    label: string;
}

export function generateData(
    nodeNumber: number = 50,
    linkDublicationNumber: number = 1,
) {
    const nodes: NodeDefinition[] = [];
    const links: LinkModel<{label: string}>[] = [];
    const linkMap = new Set<string>();

    for (let i = 0; i < nodeNumber; i++) {
        nodes.push({
            id: `Node-${i}`,
            data: {
                label: 'Node ' + i,
                types: i % 10 === 0 ? ['l3graph-node-custome'] : ['l3graph-node'],
            },
            position: { x: 0, y: 0, z: 0 },
        });
    }

    for (let i = 0; i < nodeNumber; i++) {
        const sourceIndex = i;
        const targetIndex = Math.round(Math.random() * (nodes.length - 1));
        const key = `${sourceIndex}~${targetIndex}`;
        if (!linkMap.has(key) && sourceIndex !== targetIndex) {
            linkMap.add(key);
            for (let j = 0; j < linkDublicationNumber; j++) {
                links.push({
                    id: `Link_${key}_${j}`,
                    sourceId: nodes[sourceIndex].id,
                    targetId: nodes[targetIndex].id,
                    data: { label: `Link_${i}_${j}` },
                });
            }
        }
    }

    return {nodes, links};
}
