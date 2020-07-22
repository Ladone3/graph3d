import { DEFAULT_NODE_OVERLAY } from './defaultOverlay';
import { ViewTemplate, TemplateProvider } from './templates';
import { MeshKind } from './mesh';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
import { Node } from '../models/graph/node';

export const DEFAULT_NODE_TEMPLATE: ViewTemplate<Node<GraphDescriptor>> = {
    mesh: () => ({
        type: MeshKind.Primitive,
        shape: 'sphere',
    }),
    overlay: DEFAULT_NODE_OVERLAY,
};

export const DEFAULT_NODE_TEMPLATE_PROVIDER: TemplateProvider<Node<GraphDescriptor>> = () => {
    return DEFAULT_NODE_TEMPLATE;
};
