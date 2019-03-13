import { Node, NodeModel, NodeParameters, NodeId } from './node';
import { Link, LinkModel, LinkId } from './link';
import { Subscribable } from '../../utils/subscribable';
import { GraphDescriptor } from './graphDescriptor';
export declare type NodeDefinition<NodeContent> = NodeModel<NodeContent> & NodeParameters;
export declare type Element<Descriptor extends GraphDescriptor> = Node<Descriptor> | Link<Descriptor>;
export declare type ElementModel<Descriptor extends GraphDescriptor> = NodeModel<Descriptor['nodeContentType']> | LinkModel<Descriptor['linkContentType']>;
export interface GraphModelEvents<Descriptor extends GraphDescriptor> {
    'add:nodes': Node<Descriptor>[];
    'remove:nodes': Node<Descriptor>[];
    'update:nodes': Node<Descriptor>[];
    'add:links': Link<Descriptor>[];
    'remove:links': Link<Descriptor>[];
    'update:links': Link<Descriptor>[];
}
export interface ImmutableMap<K, V> {
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    readonly size: number;
}
export interface ImmutableSet<T> {
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    readonly size: number;
}
export declare class GraphModel<Descriptor extends GraphDescriptor> extends Subscribable<GraphModelEvents<Descriptor>> {
    private _nodes;
    private _links;
    readonly nodes: ImmutableMap<NodeId, Node<Descriptor>>;
    readonly links: ImmutableMap<LinkId, Link<Descriptor>>;
    getNodeById(id: NodeId): Node<Descriptor>;
    getLinkById(id: LinkId): Link<Descriptor>;
    addNodes(nodes: NodeDefinition<Descriptor['nodeContentType']>[]): void;
    addLinks(models: LinkModel<Descriptor['linkContentType']>[]): void;
    updateNodes(definitions: NodeDefinition<Descriptor['nodeContentType']>[]): void;
    updateLinks(models: LinkModel<Descriptor['linkContentType']>[]): void;
    private subscribeOnNode;
    private subscribeOnLink;
    private unsubscribeFromElement;
    private performNodeUpdate;
    private performLinkUpdate;
    removeNodes(nodes: Node<Descriptor>[]): void;
    removeLinks(links: Link<Descriptor>[]): void;
}
