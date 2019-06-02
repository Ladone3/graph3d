import { Node } from './node';
import { Link, getGroupId } from './link';
import { Subscribable } from '../utils/subscribeable';

export type Element = Node | Link;

export function isNode(element: Element): element is Node {
    return element instanceof Node;
}

export function isLink(element: Element): element is Link {
    return element instanceof Link;
}

export interface LinkGroup { targetId: string; sourceId: string; links: Link[]; }

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

export class GraphModel extends Subscribable<GraphModelEvents> {
    public _fullUpdateList: Set<string> = new Set();
    private _nodes: Map<string, Node> = new Map();
    private _links: Map<string, Link> = new Map();
    private _alignedLinksMap: Map<string, LinkGroup> = new Map();

    get nodes(): ImmutableMap<string, Node> {
        return this._nodes;
    }

    get links(): ImmutableMap<string, Link> {
        return this._links;
    }

    public getGroup(link: Link): LinkGroup {
        const groupId = getGroupId(link);
        return this._alignedLinksMap.get(groupId);
    }

    public getElementById(id: string) {
        return this.nodes.get(id) || this.links.get(id);
    }

    public addElements(elements: Element[]) {
        const newElements: Element[] = [];
        for (const element of elements) {
            if (isNode(element) && !this._nodes.has(element.id)) {
                this._nodes.set(element.id, element);
                this.subscribeOnNode(element);
                newElements.push(element);
            } else if (isLink(element) && !this._links.has(element.id)) {
                this.addToGroup(element);
                element.source = this._nodes.get(element._sourceId);
                element.target = this._nodes.get(element._targetId);
                if (element.source && element.target) {
                    this._links.set(element.id, element);
                    element.source.outgoingLinks.set(element.id, element);
                    element.target.incomingLinks.set(element.id, element);
                    this.subscribeOnLink(element);
                    newElements.push(element);
                }
            }
        }
        this.trigger('add:elements', newElements);
    }

    public updateElementsData(elements: Element[]) {
        for (const element of elements) {
            this._fullUpdateList.add(element.id);
            if (isNode(element)) {
                const node = this._nodes.get(element.id);
                node.setData(element.data);
                node.setTypes(element.types);
            } else {
                const link = this._links.get(element.id);
                link.setTypes(element.types);
                link.setLabel(element.label);
            }
        }
    }

    private addToGroup(link: Link) {
        const groupId = getGroupId(link);
        if (!this._alignedLinksMap.has(groupId)) {
            this._alignedLinksMap.set(groupId, {
                sourceId: link._sourceId,
                targetId: link._targetId,
                links: [link],
            });
        } else {
            const group = this._alignedLinksMap.get(groupId);
            group.links.push(link);
            for (const l of group.links) {
                if (l !== link) {
                    this._fullUpdateList.add(l.id);
                    l.forceUpdate();
                }
            }
        }
    }

    private removeFromGroup(link: Link) {
        const groupId = getGroupId(link);
        if (this._alignedLinksMap.has(groupId)) {
            const alignedLinks = this._alignedLinksMap.get(groupId);
            const index = alignedLinks.links.indexOf(link);
            alignedLinks.links.splice(index, 1);
            if (alignedLinks.links.length === 0) {
                this._alignedLinksMap.delete(groupId);
            }
        }
    }

    private subscribeOnNode(element: Node) {
        element.on('force-update', () => this.performNodeUpdate(element));
        element.on('change:position', () => this.performNodeUpdate(element));
        element.on('change:size', () => this.performNodeUpdate(element));
    }

    private subscribeOnLink(element: Link) {
        element.on('force-update', () => this.performLinkUpdate(element));
    }

    private unsubscribeFromElement(element: Element) {
        // if (isNode(element)) {
        //     element.on('');
        // } else if (isLink(element)) {

        // }
    }

    private performNodeUpdate(node: Node) {
        this.trigger('update:element', node);
        node.incomingLinks.forEach(link => {
            this.trigger('update:element', link);
        });
        node.outgoingLinks.forEach(link => {
            this.trigger('update:element', link);
        });
    }

    private performLinkUpdate(link: Link) {
        this.trigger('update:element', link);
    }

    public removeNodes(nodes: Node[]) {
        const nodesToDelete: Node[] = [];
        const linksToDelete: Link[] = [];
        for (const {id} of nodes) {
            if (this._nodes.has(id)) {
                const n = this._nodes.get(id);
                nodesToDelete.push(n);
                n.incomingLinks.forEach(l => {
                    linksToDelete.push(l);
                });
                n.outgoingLinks.forEach(l => {
                    linksToDelete.push(l);
                });
            }
        }
        this.removeLinks(linksToDelete);
        for (const node of nodesToDelete) {
            this._nodes.delete(node.id);
        }
        this.trigger('remove:elements', nodesToDelete);
    }

    public removeLinks(links: Link[]) {
        const deletedLinks: Link[] = [];
        for (const {id} of links) {
            if (this._links.has(id)) {
                const l = this._links.get(id);
                deletedLinks.push(l);
                this._links.delete(id);
                this.removeFromGroup(l);
            }
        }
        this.trigger('remove:elements', links);
    }

    public removeElements(elements: Element[]) {
        const nodesToDelete: Node[] = [];
        const linksToDelete: Link[] = [];
        for (const element of elements) {
            this.unsubscribeFromElement(element);
            if (isNode(element)) {
                nodesToDelete.push(element);
            } else if (isLink(element)) {
                linksToDelete.push(element);
            }
        }
        if (linksToDelete.length > 0) {
            this.removeLinks(linksToDelete);
        }
        if (nodesToDelete.length > 0) {
            this.removeNodes(nodesToDelete);
        }
    }
}
