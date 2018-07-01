import { Node } from './node';
import * as _ from 'lodash';
import { Subscribable } from '../utils/subscribeable';

export const DEFAULT_LINK_ID = 'o3d-link';

export interface LinkParameters {
    id?: string;
    sourceId: string;
    targetId: string;
    label: string;
    types?: string[];
}

export interface LinkEvents {
    'change:label': string;
    'force-update': void;
    'remove': void;
}

export class Link extends Subscribable<LinkEvents> {
    public readonly id: string;
    public readonly types: string[];
    private _label: string;

    public source: Node;
    public target: Node;

    public _sourceId: string;
    public _targetId: string;

    constructor(parameters: LinkParameters) {
        super();

        this.id = parameters.id || _.uniqueId('Link-');
        this.types = parameters.types || [DEFAULT_LINK_ID];
        this._label = parameters.label;
        this._sourceId = parameters.sourceId;
        this._targetId = parameters.targetId;
    }

    get label() {
        return this._label;
    }
    set label(label: string) {
        const previous = this._label;
        this._label = label;
        this.trigger('change:label', previous);
    }

    forceUpdate() {
        this.trigger('force-update');
    }

    remove() {
        this.trigger('remove');
    }
}
