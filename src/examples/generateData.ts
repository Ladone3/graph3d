import { LinkModel, NodeDefinition } from '../index';
import { CustomGraphDescriptor } from './example';

export interface NodeData {
    label: string;
}

export function generateData(
    nodeNumber: number = 50,
    linkDuplicationNumber: number = 1,
) {
    const nodes: NodeDefinition<CustomGraphDescriptor['nodeContentType']>[] = [];
    const links: LinkModel<CustomGraphDescriptor['linkContentType']>[] = [];
    const linkMap = new Set<string>();

    for (let i = 0; i < nodeNumber; i++) {
        nodes.push({
            id: `Node-${i}`,
            data: {
                name: 'Node ' + i,
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
            for (let j = 0; j < linkDuplicationNumber; j++) {
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
