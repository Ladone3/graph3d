import { LinkViewTemplate, LinkTemplateProvider } from '.';

export const DEFAULT_LINK_TEMPLATE: LinkViewTemplate = {
    color: 'blue',
};

export const DEFAULT_LINK_TEMPLATE_PROVIDER: LinkTemplateProvider = (types: string[]) => {
    return DEFAULT_LINK_TEMPLATE;
};
