import { DEFAULT_NODE_OVERLAY } from './defaultOverlay';
import { ViewTemplate, TemplateProvider } from './templates';
import { MeshKind } from './mesh';
import { DefaultDescriptor } from '../models/graph/graphDescriptor';
import { Node } from '../models/graph/node';

export const DEFAULT_NODE_TEMPLATE: ViewTemplate<Node<DefaultDescriptor>> = {
    mesh: () => ({
        type: MeshKind.Primitive,
        shape: 'sphere',
    }),
    overlay: DEFAULT_NODE_OVERLAY,
};

export const DEFAULT_NODE_TEMPLATE_PROVIDER: TemplateProvider<Node<DefaultDescriptor>> = () => {
    return DEFAULT_NODE_TEMPLATE;
};
