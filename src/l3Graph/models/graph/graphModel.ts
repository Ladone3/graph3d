import { Node, NodeModel, NodeParameters, NodeId } from './node';
import { Link, LinkModel, LinkId } from './link';
import { Subscribable } from '../../utils/subscribable';
import { GraphDescriptor } from './graphDescriptor';

export type NodeDefinition<NodeContent> = NodeModel<NodeContent> & NodeParameters;
export type Element<Descriptor extends GraphDescriptor> =
    Node<Descriptor> | Link<Descriptor>;
export type ElementModel<Descriptor extends GraphDescriptor> =
    NodeModel<Descriptor['nodeContentType']> | LinkModel<Descriptor['linkContentType']>;

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

export class GraphModel<Descriptor extends GraphDescriptor> extends Subscribable<GraphModelEvents<Descriptor>> {
    private _nodes: Map<NodeId, Node<Descriptor>> = new Map();
    private _links: Map<LinkId, Link<Descriptor>> = new Map();

    get nodes(): ImmutableMap<NodeId, Node<Descriptor>> {
        return this._nodes;
    }

    get links(): ImmutableMap<LinkId, Link<Descriptor>> {
        return this._links;
    }

    public getNodeById(id: NodeId) {
        return this.nodes.get(id);
    }

    public getLinkById(id: LinkId) {
        return this.links.get(id);
    }

    public addNodes(nodes: NodeDefinition<Descriptor['nodeContentType']>[]) {
        const newNodes: Node<Descriptor>[] = [];
        for (const model of nodes) {
            if (!this._nodes.has(model.id)) {
                const parameters: NodeParameters = model;
                const node = new Node(model, parameters);
                this._nodes.set(model.id, node);
                this.subscribeOnNode(node);
                newNodes.push(node);
            }
        }
        if (newNodes.length > 0) {
            this.trigger('add:nodes', newNodes);
        }
    }

    public addLinks(models: LinkModel<Descriptor['linkContentType']>[]) {
        const newLinks: Link<Descriptor>[] = [];
        for (const model of models) {
            if (!this._links.has(model.id)) {
                const endpointsAreNotExists = !(
                    this._nodes.has(model.sourceId) &&
                    this._nodes.has(model.targetId)
                );
                if (endpointsAreNotExists) {
                    throw new Error(`Endpoint ${this._nodes.has(model.sourceId) ?
                        model.targetId : model.sourceId
                    } is not exists!`);
                }
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
                    newLinks.push(link);
                }
            }
        }
        if (newLinks.length > 0) {
            this.trigger('add:links', newLinks);
        }
    }

    public updateNodes(definitions: NodeDefinition<Descriptor['nodeContentType']>[]) {
        for (const definition of definitions) {
            const node = this._nodes.get(definition.id);
            node.setData(definition.data);
            node.setPosition(definition.position);
            if (definition.size) {
                node.setSize(definition.size);
            }
        }
    }

    public updateLinks(models: LinkModel<Descriptor['linkContentType']>[]) {
        for (const model of models) {
            const link = this._links.get(model.id);
            link.setData(model.data);
        }
    }

    private subscribeOnNode(element: Node<Descriptor>) {
        element.on('force-update', () => this.performNodeUpdate(element));
        element.on('change:position', () => this.performNodeUpdate(element));
        element.on('change:size', () => this.performNodeUpdate(element));
    }

    private subscribeOnLink(element: Link<Descriptor>) {
        element.on('force-update', () => this.performLinkUpdate(element));
    }

    private unsubscribeFromElement(element: Element<Descriptor>) {
        // do nothing for now
    }

    private performNodeUpdate(node: Node<Descriptor>) {
        this.trigger('update:nodes', [node]);

        const updatedLinks: Link<Descriptor>[] = [];
        node.incomingLinks.forEach(link => {
            updatedLinks.push(link);
        });
        node.outgoingLinks.forEach(link => {
            updatedLinks.push(link);
        });
        if (updatedLinks.length > 0) {
            this.trigger('update:links', updatedLinks);
        }
    }

    private performLinkUpdate(link: Link<Descriptor>) {
        this.trigger('update:links', [link]);
    }

    public removeNodes(nodes: Node<Descriptor>[]) {
        const nodesToDelete: Node<Descriptor>[] = [];
        const linksToDelete: Link<Descriptor>[] = [];
        for (const {id} of nodes) {
            if (this._nodes.has(id)) {
                const n = this._nodes.get(id);
                this.unsubscribeFromElement(n);

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
        this.trigger('remove:nodes', nodesToDelete);
    }

    public removeLinks(links: Link<Descriptor>[]) {
        const deletedLinks: Link<Descriptor>[] = [];
        for (const link of links) {
            const id = link.id;
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
        this.trigger('remove:links', deletedLinks);
    }
}
