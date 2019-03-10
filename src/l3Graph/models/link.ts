import { Node } from './node';
import { uniqueId } from 'lodash';
import { Subscribable } from '../utils/subscribeable';
import { createUUID, isTypesEqual } from '../utils';

const LINK_HASH_POSTFIX = createUUID();

export const DEFAULT_LINK_ID = 'o3d-link';

export interface LinkParameters {
    id?: string;
    sourceId: string;
    targetId: string;
    label: string;
    types?: string[];
}

export interface LinkEvents {
    'force-update': void;
    'remove': void;
}

export class Link extends Subscribable<LinkEvents> {
    get id() {
        return `Link~From(${this._sourceId})With(${this._types.join('/')})To(${this._targetId})#${LINK_HASH_POSTFIX}`;
    }
    public source: Node;
    public target: Node;
    public _sourceId: string;
    public _targetId: string;

    private _label: string;
    private _types: string[];

    constructor(parameters: LinkParameters) {
        super();

        this._types = parameters.types || [DEFAULT_LINK_ID];
        this._label = parameters.label;
        this._sourceId = parameters.sourceId;
        this._targetId = parameters.targetId;
    }

    get types() {
        return this._types;
    }
    set types(types: string[]) {
        if (!isTypesEqual(this._types, types)) {
            this._types = types;
            this.trigger('force-update');
        }
    }

    get label() {
        return this._label;
    }
    set label(label: string) {
        if (this._label !== label) {
            this._label = label;
            this.trigger('force-update');
        }
    }

    forceUpdate() {
        this.trigger('force-update');
    }

    remove() {
        this.trigger('remove');
    }
}

export function getGroupId(link: Link): string {
    return [link._sourceId, link._targetId].sort().join('<==>') + `:${LINK_HASH_POSTFIX}`;
}
