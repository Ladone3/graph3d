import { Node, NodeId } from './node';
import { Subscribable } from '../../utils/subscribable';
import { GraphDescriptor } from './graphDescriptor';

export const DEFAULT_LINK_ID = 'l3graph-link';

export type LinkId = string & { linkPlaceholder?: boolean };

export interface LinkModel<LinkContent> {
    id: LinkId;
    sourceId: NodeId;
    targetId: NodeId;
    data?: LinkContent;
}

export interface LinkParameters<Descriptor extends GraphDescriptor> {
    source: Node<Descriptor>;
    target: Node<Descriptor>;
}

export interface LinkEvents {
    'force-update': void;
}

export class Link<Descriptor extends GraphDescriptor = GraphDescriptor> extends Subscribable<LinkEvents> {
    public readonly source: Node<Descriptor>;
    public readonly target: Node<Descriptor>;
    public modelIsChanged: boolean = false;

    constructor(
        public readonly model: LinkModel<Descriptor['linkContentType']>,
        parameters: LinkParameters<Descriptor>,
    ) {
        super();
        this.source = parameters.source;
        this.target = parameters.target;
    }

    get id() {
        return this.model.id;
    }

    get data() {
        return this.model.data;
    }
    setData(data: Descriptor['linkContentType']) {
        this.model.data = data;
        this.modelIsChanged = true;
        this.forceUpdate();
    }

    forceUpdate() {
        this.trigger('force-update');
    }
}
