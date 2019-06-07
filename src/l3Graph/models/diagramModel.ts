import { ElementDefinition, GraphModel, ImmutableMap, NodeDefinition, ElementModel } from './graphModel';
import { Subscribable, EventObject } from '../utils/subscribeable';
import { NodeModel, Node } from '../models/node';
import { LinkModel, Link, getLinkId } from '../models/link';
import { WidgetsModel } from './widgets/widgetsModel';
import { Selection } from './selection';
import { isTypesEqual } from '../utils';

export interface Graph {
    nodes: NodeDefinition[];
    links: LinkModel[];
}

interface GraphPatch {
    newNodes?: NodeDefinition[];
    newLinks?: LinkModel[];
    nodesToRemove?: NodeModel[];
    linksToRemove?: LinkModel[];
    nodesToUpdate?: NodeDefinition[];
    linksToUpdate?: LinkModel[];
}

export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Set<EventObject>;
        widgetEvents: Set<EventObject>;
    };
}

export class DiagramModel extends Subscribable<DiagramModelEvents> {
    public graph: GraphModel;
    public widgets: WidgetsModel;
    public selection: Selection;

    private deprecatedSelection: ReadonlySet<ElementDefinition> = new Set();
    private animationFrame: number;
    private graphEvents: Set<EventObject> = new Set();
    private widgetEvents: Set<EventObject> = new Set();

    constructor() {
        super();
        this.graph = new GraphModel();
        this.widgets = new WidgetsModel();
        this.selection = new Selection({graph: this.graph});

        this.graph.on('add:elements', this.groupGraphEvents);
        this.graph.on('remove:elements', this.groupGraphEvents);
        this.graph.on('update:element', this.groupGraphEvents);

        this.widgets.on('add:widget', this.groupWidgetEvents);
        this.widgets.on('remove:widget', this.groupWidgetEvents);
        this.widgets.on('update:widget', this.groupWidgetEvents);
    }

    public get nodes(): ImmutableMap<string, Node> {
        return this.graph.nodes;
    }

    public get links(): ImmutableMap<string, Link> {
        return this.graph.links;
    }

    public addElements(elements: ElementDefinition[]) {
        this.graph.addElements(elements);
    }

    public removeElements(elements: ElementModel[]) {
        this.graph.removeElements(elements);
    }

    public removeNodes(nodes: NodeModel[]) {
        this.graph.removeNodes(nodes);
    }

    public removeLinks(links: LinkModel[]) {
        this.graph.removeLinks(links);
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

    public updateGraph(elements: Graph) {
        this.applyGraphPatch(
            this.createPatch(elements),
        );
    }

    private applyGraphPatch(update: GraphPatch) {
        const {newNodes, newLinks, nodesToRemove, linksToRemove, linksToUpdate, nodesToUpdate} = update;
        if (newNodes) { this.addElements(newNodes); }
        if (newLinks) { this.addElements(newLinks); }
        if (linksToRemove && linksToRemove.length > 0) {this.removeLinks(linksToRemove);  }
        if (nodesToRemove && nodesToRemove.length > 0) { this.removeNodes(nodesToRemove); }
        if (nodesToUpdate && nodesToUpdate.length > 0) { this.graph.updateNodes(nodesToUpdate); }
        if (linksToUpdate && linksToUpdate.length > 0) { this.graph.updateLinks(linksToUpdate); }
    }

    private createPatch(newGraphModel: Graph): GraphPatch {
        const graph = this.graph;
        const {nodes, links} = newGraphModel;

        const newNodes: NodeDefinition[] = [];
        const newLinks: LinkModel[] = [];
        const nodesToRemove: NodeModel[] = [];
        const linksToRemove: LinkModel[] = [];
        const nodesToUpdate: NodeDefinition[] = [];
        const linksToUpdate: LinkModel[] = [];

        const nodeMap = new Map<string, NodeModel>();
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

        const linksMap = new Map<string, LinkModel>();
        for (const link of links) {
            const id = getLinkId(link);
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
                    linksToRemove.push(link.model);
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
}
