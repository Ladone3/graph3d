import { Node, NodeModel, NodeParameters } from './node';
import { Link, LinkModel, getLinkId, LinkParameters } from './link';
import { Subscribable } from '../utils/subscribeable';

export type NodeDefinition<Contetnt = any> = NodeModel<Contetnt> & NodeParameters;

export type Element = Node | Link;
export type ElementModel = NodeModel | LinkModel;
export type ElementDefinition = NodeDefinition | LinkModel;

function isNodeModel(elementModel: ElementModel): elementModel is NodeModel {
    return !isLinkModel(elementModel);
}

function isLinkModel(elementModel: ElementModel): elementModel is LinkModel {
    return (elementModel as any).sourceId !== undefined &&
        (elementModel as any).targetId !== undefined;
}

export interface GraphModelEvents {
    'add:elements': Element[];
    'remove:elements': Element[];
    'update:element': Element;
    'update:element:model': Element;
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
    private _nodes: Map<string, Node> = new Map();
    private _links: Map<string, Link> = new Map();

    get nodes(): ImmutableMap<string, Node> {
        return this._nodes;
    }

    get links(): ImmutableMap<string, Link> {
        return this._links;
    }

    public getElementById(id: string) {
        return this.nodes.get(id) || this.links.get(id);
    }

    public addElements(models: ElementDefinition[]) {
        const newElements: Element[] = [];
        for (const model of models) {
            if (isNodeModel(model) && !this._nodes.has(model.id)) {
                const parameters: NodeParameters = model;
                const node = new Node(model, parameters);
                this._nodes.set(model.id, node);
                this.subscribeOnNode(node);
                newElements.push(node);
            } else if (isLinkModel(model) && !this._links.has(getLinkId(model))) {
                const linkParams = {
                    source: this._nodes.get(model.sourceId),
                    target: this._nodes.get(model.targetId),
                };
                if (linkParams.source && linkParams.target) {
                    const link = new Link(model, linkParams);

                    this._links.set(link.id, link);
                    link.source.outgoingLinks.add(link);
                    link.target.incomingLinks.add(link);
                    this.subscribeOnLink(link);
                    newElements.push(link);
                }
            }
        }
        if (newElements.length > 0) {
            this.trigger('add:elements', newElements);
        }
    }

    public updateNodes(definitions: NodeDefinition[]) {
        for (const definition of definitions) {
            const node = this._nodes.get(definition.id);
            node.setData(definition.data);
            node.setTypes(definition.types);
            node.setPosition(definition.position);
            if (definition.size) {
                node.setSize(definition.size);
            }
        }
    }

    public updateLinks(models: LinkModel[]) {
        for (const model of models) {
            const link = this._links.get(getLinkId(model));
            link.setTypes(model.types);
            link.setLabel(model.label);
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

    public removeNodes(nodes: NodeModel[]) {
        const nodesToDelete: Node[] = [];
        const linksToDelete: LinkModel[] = [];
        for (const {id} of nodes) {
            if (this._nodes.has(id)) {
                const n = this._nodes.get(id);
                this.unsubscribeFromElement(n);

                nodesToDelete.push(n);
                n.incomingLinks.forEach(l => {
                    linksToDelete.push(l.model);
                });
                n.outgoingLinks.forEach(l => {
                    linksToDelete.push(l.model);
                });
            }
        }
        this.removeLinks(linksToDelete);
        for (const node of nodesToDelete) {
            this._nodes.delete(node.id);
        }
        this.trigger('remove:elements', nodesToDelete);
    }

    public removeLinks(links: LinkModel[]) {
        const deletedLinks: Link[] = [];
        for (const link of links) {
            const id = getLinkId(link);
            if (this._links.has(id)) {
                const l = this._links.get(id);
                this.unsubscribeFromElement(l);

                deletedLinks.push(l);
                this._links.delete(id);
                l.source.incomingLinks.delete(l);
                l.source.outgoingLinks.delete(l);
                l.target.incomingLinks.delete(l);
                l.target.outgoingLinks.delete(l);
            }
        }
        this.trigger('remove:elements', deletedLinks);
    }

    public removeElements(models: ElementModel[]) {
        const nodesToDelete: NodeModel[] = [];
        const linksToDelete: LinkModel[] = [];
        for (const model of models) {
            if (isNodeModel(model)) {
                nodesToDelete.push(model);
            } else if (isLinkModel(model)) {
                linksToDelete.push(model);
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
