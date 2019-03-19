import { Element, GraphModel } from './graphModel';
import { Subscribable, EventObject } from '../utils/subscribeable';
import { Node } from '../models/node';
import { Link } from '../models/link';
import { WidgetsModel } from './widgetsModel';
import { Selection } from './selection';
import { isTypesEqual } from '../utils';

export interface GraphElements {
    nodes: Node[];
    links: Link[];
}

interface GraphUpdate {
    newNodes?: Node[];
    newLinks?: Link[];
    nodesToRemove?: Node[];
    linksToRemove?: Link[];
    nodesToUpdate?: Node[];
    linksToUpdate?: Link[];
}

export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Set<EventObject>;
        widgetEvents: Set<EventObject>;
    };
    'change:selection': ReadonlySet<Element>;
}

export class DiagramModel extends Subscribable<DiagramModelEvents> {
    public graph: GraphModel;
    public widgets: WidgetsModel;
    private deprecatedSelection: ReadonlySet<Element> = new Set();
    private animationFrame: number;

    private graphEvents: Set<EventObject> = new Set();
    private widgetEvents: Set<EventObject> = new Set();

    private _selection: Selection;

    constructor() {
        super();
        this.graph = new GraphModel();
        this.widgets = new WidgetsModel();
        this.initSelectionWidget();

        this.graph.on('add:elements', this.groupGraphEvents);
        this.graph.on('remove:elements', this.groupGraphEvents);
        this.graph.on('update:element', this.groupGraphEvents);

        this.widgets.on('add:widget', this.groupWidgetEvents);
        this.widgets.on('remove:widget', this.groupWidgetEvents);
        this.widgets.on('update:widget', this.groupWidgetEvents);
    }

    public get selection(): ReadonlySet<Element> {
        return this._selection.selection;
    }

    public set selection(newSelection: ReadonlySet<Element>) {
        const oldSelection = this._selection.selection;
        this._selection.selection = newSelection as ReadonlySet<Element>;
        this.trigger('change:selection', oldSelection);
    }

    public get nodes(): Map<string, Node> {
        return this.graph.nodes;
    }

    public get links(): Map<string, Link> {
        return this.graph.links;
    }

    public addElements(elements: Element[]) {
        this.graph.addElements(elements);
    }

    public removeElements(elements: Element[]) {
        this.graph.removeElements(elements);
    }

    public removeNodesByIds(nodeIds: string[]) {
        this.graph.removeNodesByIds(nodeIds);
    }

    public removeLinksByIds(linkIds: string[]) {
        this.graph.removeLinksByIds(linkIds);
    }

    private updateElements(elements: Element[]) {
        this.graph.updateElementsData(elements);
    }

    public performSyncUpdate = () => {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(() => {
            const events = {
                graphEvents: this.graphEvents,
                widgetEvents: this.widgetEvents,
                deprecatedSelection: this.deprecatedSelection,
            };
            this.graphEvents = new Set();
            this.widgetEvents = new Set();
            this.trigger('syncupdate', events);
        });
    }

    public updateGraph(elements: GraphElements) {
        this.applyGraphUpdate(
            this.merge(elements),
        );
    }

    private applyGraphUpdate(update: GraphUpdate) {
        const {newNodes, newLinks, nodesToRemove, linksToRemove, linksToUpdate, nodesToUpdate} = update;
        if (newNodes) { this.addElements(newNodes); }
        if (newLinks) { this.addElements(newLinks); }
        if (linksToRemove && linksToRemove.length > 0) { this.removeLinksByIds(linksToRemove.map(l => l.id)); }
        if (nodesToRemove && nodesToRemove.length > 0) { this.removeNodesByIds(nodesToRemove.map(n => n.id)); }
        if (nodesToUpdate && nodesToUpdate.length > 0) { this.updateElements(nodesToUpdate); }
        if (linksToUpdate && linksToUpdate.length > 0) { this.updateElements(linksToUpdate); }
    }

    private merge(newGraphModel: GraphElements): GraphUpdate {
        const graph = this.graph;
        const {nodes, links} = newGraphModel;

        const newNodes: Node[] = [];
        const newLinks: Link[] = [];
        const nodesToRemove: Node[] = [];
        const linksToRemove: Link[] = [];
        const nodesToUpdate: Node[] = [];
        const linksToUpdate: Link[] = [];

        const nodeMap = new Map<string, Node>();
        for (const node of nodes) {
            const id = node.id;
            if (!graph.nodes.has(id)) {
                newNodes.push(node);
            } else {
                const curNode = graph.nodes.get(id);
                const needUpdateView =
                    curNode.data !== node.data ||
                    !isTypesEqual(curNode.types, node.types);

                if (needUpdateView) {
                    nodesToUpdate.push(node);
                }
            }
            nodeMap.set(id, node);
        }
        if (graph.nodes) {
            graph.nodes.forEach(node => {
                if (!nodeMap.has(node.id)) {
                    nodesToRemove.push(node);
                }
            });
        }

        const linksMap = new Map<string, Link>();
        for (const link of links) {
            const id = link.id;
            if (!graph.links.has(id)) {
                newLinks.push(link);
            } else {
                const curLink = graph.links.get(id);
                const needUpdateView =
                    curLink.label !== link.label ||
                    curLink.types.sort().join('') !== link.types.sort().join('');

                if (needUpdateView) {
                    linksToUpdate.push(link);
                }
            }
            linksMap.set(id, link);
        }
        if (graph.links) {
            graph.links.forEach(link => {
                if (!linksMap.has(link.id)) {
                    linksToRemove.push(link);
                }
            });
        }

        return {newNodes, newLinks, nodesToRemove, linksToRemove, nodesToUpdate, linksToUpdate};
    }

    private groupGraphEvents = (event: EventObject) => {
        this.graphEvents.add(event);
        this.performSyncUpdate();
    }

    private groupWidgetEvents = (event: EventObject) => {
        this.widgetEvents.add(event);
        this.performSyncUpdate();
    }

    private initSelectionWidget() {
        this._selection = new Selection();
        this.widgets.registerWidget(this._selection);
    }
}
