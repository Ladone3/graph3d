import { LinkViewTemplate, LinkTemplateProvider } from '.';
import { DefaultLinkOverlay } from './defaultOverlay';

export const DEFAULT_LINK_TEMPLATE: LinkViewTemplate = {
    color: 'gray',
    thickness: 1,
    overlay: {
        get: () => {
            return DefaultLinkOverlay;
        },
        context: undefined,
    },
};

export const DEFAULT_LINK_TEMPLATE_PROVIDER: LinkTemplateProvider = (types: string[]) => {
    return DEFAULT_LINK_TEMPLATE;
};
