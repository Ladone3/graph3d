import { Node } from './node';
import { Subscribable } from '../../utils/subscribable';
import { generate128BitID } from '../../utils';

export const DEFAULT_LINK_ID = 'l3graph-link';

export interface LinkModel<LinkContent = any> {
    id: string;
    sourceId: string;
    targetId: string;
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
