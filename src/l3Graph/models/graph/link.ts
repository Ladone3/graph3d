import { Node, NodeId } from './node';
import { Subscribable } from '../../utils/subscribable';

export const DEFAULT_LINK_ID = 'l3graph-link';

export type LinkId = String & { linkPlaceholder?: boolean };

export interface LinkModel<LinkContent = any> {
    id: LinkId;
    sourceId: NodeId;
    targetId: NodeId;
    data?: LinkContent;
}

export interface LinkParameters {
    source: Node;
    target: Node;
}

export interface LinkEvents {
    'force-update': void;
}

export class Link<LinkContent = any> extends Subscribable<LinkEvents> {
    public readonly source: Node;
    public readonly target: Node;
    public modelIsChanged: boolean = false;

    constructor(
        public readonly model: LinkModel,
        parameters: LinkParameters,
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
    setData(data: LinkContent) {
        this.model.data = data;
        this.modelIsChanged = true;
        this.forceUpdate();
    }

    forceUpdate() {
        this.trigger('force-update');
    }
}
