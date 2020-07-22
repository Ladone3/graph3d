import { DEFAULT_LINK_OVERLAY } from './defaultOverlay';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
import { LinkViewTemplate, TemplateProvider } from './templates';
import { Link } from '../models/graph/link';

export const DEFAULT_LINK_TEMPLATE: LinkViewTemplate<GraphDescriptor> = {
    color: 'gray',
    thickness: 1,
    overlay: DEFAULT_LINK_OVERLAY,
};

export const DEFAULT_LINK_TEMPLATE_PROVIDER: TemplateProvider<Link<GraphDescriptor>, GraphDescriptor> = () => {
    return DEFAULT_LINK_TEMPLATE;
};
