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

export class GraphModel extends Subscribable<GraphModelEvents> {
    public nodes: Map<string, Node> = new Map();
    public links: Map<string, Link> = new Map();
    public fullUpdateList: Set<string> = new Set();

    public alignedLinksMap: Map<string, LinkGroup> = new Map();
    public getGroup(link: Link): LinkGroup {
        const groupId = getGroupId(link);
        return this.alignedLinksMap.get(groupId);
    }
    public addToGroup(link: Link) {
        const groupId = getGroupId(link);
        if (!this.alignedLinksMap.has(groupId)) {
            this.alignedLinksMap.set(groupId, {
                sourceId: link._sourceId,
                targetId: link._targetId,
                links: [link],
            });
        } else {
            const group = this.alignedLinksMap.get(groupId);
            group.links.push(link);
            for (const l of group.links) {
                if (l !== link) {
                    this.fullUpdateList.add(l.id);
                    l.forceUpdate();
                }
            }
        }
    }
    public removeFromGroup(link: Link) {
        const groupId = getGroupId(link);
        if (this.alignedLinksMap.has(groupId)) {
            const alignedLinks = this.alignedLinksMap.get(groupId);
            const index = alignedLinks.links.indexOf(link);
            alignedLinks.links.splice(index, 1);
            if (alignedLinks.links.length === 0) {
                this.alignedLinksMap.delete(groupId);
            }
        }
    }

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
                this.addToGroup(element);
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

    public updateElementsData(elements: Element[]) {
        for (const element of elements) {
            this.fullUpdateList.add(element.id);
            if (isNode(element)) {
                const node = this.nodes.get(element.id);
                node.setData(element.data);
                node.setTypes(element.types);
            } else {
                const link = this.links.get(element.id);
                link.setTypes(element.types);
                link.setLabel(element.label);
            }
        }
    }

    private subscribeOnNode(element: Node) {
        element.on('force-update', () => this.performNodeUpdate(element));
        element.on('change:position', () => this.performNodeUpdate(element));
        element.on('change:size', () => this.performNodeUpdate(element));
        element.on('remove', () => this.removeElements([element]));
    }

    private subscribeOnLink(element: Link) {
        element.on('force-update', () => this.performLinkUpdate(element));
        element.on('remove', () => this.removeElements([element]));
    }

    private unsubscribeFromElement(element: Element) {
        // if (isNode(element)) {
        //     element.on('');
        // } else if (isLink(element)) {

        // }
    }

    public performNodeUpdate(node: Node) {
        this.trigger('update:element', node);
        node.incomingLinks.forEach(link => {
            this.trigger('update:element', link);
        });
        node.outgoingLinks.forEach(link => {
            this.trigger('update:element', link);
        });
    }

    public performLinkUpdate(link: Link) {
        this.trigger('update:element', link);
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
        for (const element of elements) {
            this.unsubscribeFromElement(element);
            if (isNode(element)) {
                this.nodes.delete(element.id);
            } else if (isLink(element)) {
                this.links.delete(element.id);
                this.removeFromGroup(element);
            }
        }
        this.trigger('remove:elements', elements);
    }
}
