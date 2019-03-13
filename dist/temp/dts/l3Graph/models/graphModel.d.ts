import { Node } from './node';
import { Link } from './link';
import { Subscribable } from '../utils/subscribeable';
export declare type Element = Node | Link;
export declare function isNode(element: Element): element is Node;
export declare function isLink(element: Element): element is Link;
export interface GraphModelEvents {
    'add:elements': Element[];
    'remove:elements': Element[];
    'change:element': Element;
    'refresh:element': Element;
}
export declare class GraphModel extends Subscribable<GraphModelEvents> {
    nodes: Map<string, Node>;
    links: Map<string, Link>;
    fullUpdateList: Set<string>;
    getElementById(id: string): Element;
    addElements(elements: Element[]): void;
    updateElements(elements: Element[]): void;
    private subscribeOnNode(element);
    private subscribeOnLink(element);
    private unsubscribeFromElement(element);
    performNodeUpdate(node: Node): void;
    performLinkUpdate(link: Link): void;
    removeNodesByIds(nodeIds: string[]): void;
    removeLinksByIds(linkIds: string[]): void;
    removeElements(elements: Element[]): void;
}
