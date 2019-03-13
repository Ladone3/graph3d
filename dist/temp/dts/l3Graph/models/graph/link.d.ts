import { Node } from './node';
import { Subscribable } from '../../utils/subscribable';
export declare const DEFAULT_LINK_ID = "l3graph-link";
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
export declare class Link<LinkContent = any> extends Subscribable<LinkEvents> {
    readonly model: LinkModel;
    readonly source: Node;
    readonly target: Node;
    modelIsChanged: boolean;
    constructor(model: LinkModel, parameters: LinkParameters);
    readonly id: string;
    readonly data: any;
    setData(data: LinkContent): void;
    forceUpdate(): void;
}
