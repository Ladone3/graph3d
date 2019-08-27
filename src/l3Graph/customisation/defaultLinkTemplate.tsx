import { LinkViewTemplate, LinkTemplateProvider } from '.';
import { DEFAULT_LINK_OVERLAY } from './defaultOverlay';

export const DEFAULT_LINK_TEMPLATE: LinkViewTemplate = {
    color: 'gray',
    thickness: 1,
    overlay: DEFAULT_LINK_OVERLAY,
};

export const DEFAULT_LINK_TEMPLATE_PROVIDER: LinkTemplateProvider = (types: string[]) => {
    return DEFAULT_LINK_TEMPLATE;
};
