import { LinkModel, NodeDefinition } from '../index';
export interface NodeData {
    label: string;
}
export declare function generateData(nodeNumber?: number, linkDuplicationNumber?: number): {
    nodes: NodeDefinition<any>[];
    links: LinkModel<{
        label: string;
    }>[];
};
