import { Node, NodeModel, NodeParameters, NodeId } from './node';
import { Link, LinkModel, LinkId } from './link';
import { Subscribable } from '../../utils/subscribable';
export declare type NodeDefinition<Content = any> = NodeModel<Content> & NodeParameters;
export declare type Element = Node | Link;
export declare type ElementModel = NodeModel | LinkModel;
export interface GraphModelEvents {
    'add:nodes': Node[];
    'remove:nodes': Node[];
    'update:nodes': Node[];
    'add:links': Link[];
    'remove:links': Link[];
    'update:links': Link[];
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
export declare class GraphModel extends Subscribable<GraphModelEvents> {
    private _nodes;
    private _links;
    readonly nodes: ImmutableMap<NodeId, Node>;
    readonly links: ImmutableMap<LinkId, Link>;
    getNodeById(id: NodeId): Node<any>;
    getLinkById(id: LinkId): Link<any>;
    addNodes(nodes: NodeDefinition[]): void;
    addLinks(models: LinkModel[]): void;
    updateNodes(definitions: NodeDefinition[]): void;
    updateLinks(models: LinkModel[]): void;
    private subscribeOnNode;
    private subscribeOnLink;
    private unsubscribeFromElement;
    private performNodeUpdate;
    private performLinkUpdate;
    removeNodes(nodes: Node[]): void;
    removeLinks(links: Link[]): void;
}
