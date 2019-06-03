import { Node } from './node';
import { Subscribable } from '../utils/subscribeable';
import { isTypesEqual as equalTypes } from '../utils';

export const DEFAULT_LINK_ID = 'o3d-link';

export interface LinkModel {
    sourceId: string;
    targetId: string;
    label: string;
    types?: string[];
}

export interface LinkParameters {
    source: Node;
    target: Node;
}

export interface LinkEvents {
    'force-update': void;
}

export class Link extends Subscribable<LinkEvents> {
    get id() {
        return getLinkId(this._model);
    }
    public readonly source: Node;
    public readonly target: Node;
    public modelIsChanged: boolean = false;

    constructor(
        private _model: LinkModel,
        parameters: LinkParameters,
    ) {
        super();
        this.source = parameters.source;
        this.target = parameters.target;
    }

    get types() {
        return this._model.types;
    }
    setTypes(types: string[]) {
        if (!equalTypes(this._model.types, types)) {
            this._model = {
                ...this._model,
                types,
            };
            this.modelIsChanged = true;
            this.forceUpdate();
        }
    }

    get label() {
        return this._model.label;
    }
    setLabel(label: string) {
        if (this._model.label !== label) {
            this._model.label = label;
            this.trigger('force-update');
        }
    }

    get model(): LinkModel {
        return this._model;
    }

    forceUpdate() {
        this.trigger('force-update');
    }
}

export function getGroupId(link: LinkModel): string {
    return `${[link.sourceId, link.targetId].sort().join('<==>')}`;
}

export function getLinkId(model: LinkModel): string {
    return `Link~From(${
        model.sourceId
    })With(${model.types.join('/')})To(${
        model.targetId
    })`;
}
