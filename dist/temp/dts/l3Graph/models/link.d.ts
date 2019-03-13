import { Node } from './node';
import { Subscribable } from '../utils/subscribeable';
export declare const DEFAULT_LINK_ID = "o3d-link";
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
export declare class Link extends Subscribable<LinkEvents> {
    readonly id: string;
    source: Node;
    target: Node;
    _sourceId: string;
    _targetId: string;
    private _label;
    private _types;
    constructor(parameters: LinkParameters);
    types: string[];
    label: string;
    forceUpdate(): void;
    remove(): void;
}
