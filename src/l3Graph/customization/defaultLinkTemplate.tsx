import { DEFAULT_LINK_OVERLAY } from './defaultOverlay';
import { DefaultDescriptor } from '../models/graph/graphDescriptor';
import { LinkViewTemplate, TemplateProvider } from './templates';
import { Link } from '../models/graph/link';

export const DEFAULT_LINK_TEMPLATE: LinkViewTemplate<DefaultDescriptor> = {
    color: 'gray',
    thickness: 1,
    overlay: DEFAULT_LINK_OVERLAY,
};

export const DEFAULT_LINK_TEMPLATE_PROVIDER: TemplateProvider<Link<DefaultDescriptor>, DefaultDescriptor> = () => {
    return DEFAULT_LINK_TEMPLATE;
};
