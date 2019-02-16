import { Node } from './node';
import { Link } from './link';
import { Subscribable } from '../utils/subscribeable';

export type Element = Node | Link;

export function isNode(element: Element): element is Node {
    return element instanceof Node;
}

export function isLink(element: Element): element is Link {
    return element instanceof Link;
}

export interface GraphModelEvents {
    'add:elements': Element[];
    'remove:elements': Element[];
    'change:element': Element;
    'refresh:element': Element;
}

export class GraphModel extends Subscribable<GraphModelEvents> {
    public nodes: Map<string, Node> = new Map();
    public links: Map<string, Link> = new Map();
    public fullUpdateList: Set<string> = new Set();

    public getElementById(id: string) {
        return this.nodes.get(id) || this.links.get(id);
    }

    public addElements(elements: Element[]) {
        const newElements: Element[] = [];
        for (const element of elements) {
            if (isNode(element) && !this.nodes.has(element.id)) {
                this.nodes.set(element.id, element);
                this.subscribeOnNode(element);
                newElements.push(element);
            } else if (isLink(element) && !this.links.has(element.id)) {
                element.source = this.nodes.get(element._sourceId);
                element.target = this.nodes.get(element._targetId);
                if (element.source && element.target) {
                    this.links.set(element.id, element);
                    element.source.outgoingLinks.set(element.id, element);
                    element.target.incomingLinks.set(element.id, element);
                    this.subscribeOnLink(element);
                    newElements.push(element);
                }
            }
        }
        this.trigger('add:elements', newElements);
    }

    public updateElements(elements: Element[]) {
        for (const element of elements) {
            this.fullUpdateList.add(element.id);
            if (isNode(element)) {
                const node = this.nodes.get(element.id);
                node.data = element.data;
                node.types = element.types;
            } else {
                const link = this.links.get(element.id);
                link.types = element.types;
                link.label = element.label;
            }
        }
    }

    private subscribeOnNode(element: Node) {
        element.on('force-update', event => this.performNodeUpdate(element));
        element.on('change:position', event => this.performNodeUpdate(element));
        element.on('remove', event => this.removeElements([element]));
    }

    private subscribeOnLink(element: Link) {
        element.on('force-update', event => this.performLinkUpdate(element));
        element.on('remove', event => this.removeElements([element]));
    }

    private unsubscribeFromElement(element: Element) {
        // if (isNode(element)) {
        //     element.on('');
        // } else if (isLink(element)) {

        // }
    }

    public performNodeUpdate(node: Node) {
        this.trigger('change:element', node);
        node.incomingLinks.forEach(link => {
            this.trigger('change:element', link);
        });
        node.outgoingLinks.forEach(link => {
            this.trigger('change:element', link);
        });
    }

    public performLinkUpdate(link: Link) {
        this.trigger('change:element', link);
    }

    public removeNodesByIds(nodeIds: string[]) {
        const nodes: Node[] = [];
        for (const id of nodeIds) {
            const node = this.nodes.get(id);
            if (node) {
                nodes.push(node);
            }
        }
        this.removeElements(nodes);
    }

    public removeLinksByIds(linkIds: string[]) {
        const links: Link[] = [];
        for (const id of linkIds) {
            const link = this.links.get(id);
            if (link) {
                links.push(link);
            }
        }
        this.removeElements(links);
    }

    public removeElements(elements: Element[]) {
        const elementsMap: { [id: string]: boolean } = {};
        for (const element of elements) {
            this.unsubscribeFromElement(element);
            if (isNode(element)) {
                this.nodes.delete(element.id);
            } else if (isLink(element)) {
                this.links.delete(element.id);
            }
        }
        this.trigger('remove:elements', elements);
    }
}
