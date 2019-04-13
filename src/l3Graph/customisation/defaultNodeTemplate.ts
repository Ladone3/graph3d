import { DefaultNodeOverlay } from './defaultOverlay';
import { NodeViewTemplate, NodeTemplateProvider, MeshKind } from '.';

export const DEFAULT_NODE_TEMPLATE: NodeViewTemplate<{label: string}> = {
    mesh: (data: {label: string}) => ({
        type: MeshKind.Primitive,
        shape: 'sphere',
    }),
    overlay: {
        get: (data: {label: string}) => {
            return DefaultNodeOverlay;
        },
        context: undefined,
    },
};

export const DEFAULT_NODE_TEMPLATE_PROVIDER: NodeTemplateProvider = (types: string[]) => {
    return DEFAULT_NODE_TEMPLATE;
};
