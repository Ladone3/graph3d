import { Node, NodeId } from './node';
import { Subscribable } from '../../utils/subscribable';
import { GraphDescriptor } from './graphDescriptor';
export declare const DEFAULT_LINK_ID = "l3graph-link";
export declare type LinkId = string & {
    linkPlaceholder?: boolean;
};
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
export declare class Link<Descriptor extends GraphDescriptor> extends Subscribable<LinkEvents> {
    readonly model: LinkModel<Descriptor['linkContentType']>;
    readonly source: Node<Descriptor>;
    readonly target: Node<Descriptor>;
    modelIsChanged: boolean;
    constructor(model: LinkModel<Descriptor['linkContentType']>, parameters: LinkParameters<Descriptor>);
    readonly id: LinkId;
    readonly data: Descriptor["linkContentType"];
    setData(data: Descriptor['linkContentType']): void;
    forceUpdate(): void;
}
