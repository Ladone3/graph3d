import { getColorByTypes } from '../utils/colorUtils';
import { DefaultNodeOverlay } from './defaultOverlay';
import { NodeViewTemplate, NodeTemplateProvider } from '.';

export const DEFAULT_NODE_TEMPLATE: NodeViewTemplate<{label: string}> = {
    mesh: (data: {label: string}) => ({
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
