import { LinkViewTemplate, LinkTemplateProvider } from '.';
import { DEFAULT_LINK_OVERLAY } from './defaultOverlay';
import { LinkModel } from '../models/graph/link';

export const DEFAULT_LINK_TEMPLATE: LinkViewTemplate = {
    color: 'gray',
    thickness: 1,
    overlay: DEFAULT_LINK_OVERLAY,
};

export const DEFAULT_LINK_TEMPLATE_PROVIDER: LinkTemplateProvider = (model: LinkModel<{label: string}>[]) => {
    return DEFAULT_LINK_TEMPLATE;
};
