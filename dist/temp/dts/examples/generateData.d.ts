import { LinkModel, NodeDefinition } from '../index';
export interface NodeData {
    label: string;
}
export declare function generateData(nodeNumber?: number, linkDuplicationNumber?: number): {
    nodes: NodeDefinition<{
        name?: string;
    }>[];
    links: LinkModel<{
        label?: string;
    }>[];
};
