import { DEFAULT_NODE_OVERLAY } from './defaultOverlay';
import { NodeViewTemplate, NodeTemplateProvider } from './templates';
import { MeshKind } from './mesh';

export const DEFAULT_NODE_TEMPLATE: NodeViewTemplate<{label: string}> = {
    mesh: () => ({
        type: MeshKind.Primitive,
        shape: 'sphere',
    }),
    overlay: DEFAULT_NODE_OVERLAY,
};

export const DEFAULT_NODE_TEMPLATE_PROVIDER: NodeTemplateProvider = (types: string[]) => {
    return DEFAULT_NODE_TEMPLATE;
};
