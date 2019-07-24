import { DefaultNodeOverlay } from './defaultOverlay';
import { NodeViewTemplate, NodeTemplateProvider, MeshKind } from '.';

export const DEFAULT_NODE_TEMPLATE: NodeViewTemplate<{label: string}> = {
    mesh: () => ({
        type: MeshKind.Primitive,
        shape: 'sphere',
    }),
    overlay: {
        get: () => {
            return DefaultNodeOverlay;
        },
        context: undefined,
    },
};

export const DEFAULT_NODE_TEMPLATE_PROVIDER: NodeTemplateProvider = (types: string[]) => {
    return DEFAULT_NODE_TEMPLATE;
};
