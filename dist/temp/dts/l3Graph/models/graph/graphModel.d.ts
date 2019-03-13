import { Node, NodeModel, NodeParameters } from './node';
import { Link, LinkModel } from './link';
import { Subscribable } from '../../utils/subscribeable';
export declare type NodeDefinition<Contetnt = any> = NodeModel<Contetnt> & NodeParameters;
export declare type Element = Node | Link;
export declare type ElementModel = NodeModel | LinkModel;
export interface GraphModelEvents {
    'add:elements': Element[];
    'remove:elements': Element[];
    'update:element': Element;
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
    readonly nodes: ImmutableMap<string, Node>;
    readonly links: ImmutableMap<string, Link>;
    getNodeById(id: string): Node<any>;
    getLinkById(id: string): Link<any>;
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
