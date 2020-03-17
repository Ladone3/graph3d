import { GraphModel, ImmutableMap, NodeDefinition, ElementModel } from './graph/graphModel';
import { Subscribable, EventObject } from '../utils/subscribable';
import { Node, NodeId } from './graph/node';
import { Link, LinkId } from './graph/link';
import { WidgetsModel } from './widgets/widgetsModel';
import { Selection } from './widgets/selection';

type GraphEvents = 
    EventObject<'add:nodes', Node[]> | EventObject<'remove:nodes', Node[]> | EventObject<'update:nodes', Node[]> |
    EventObject<'add:links', Link[]> | EventObject<'remove:links', Link[]> | EventObject<'update:links', Link[]>;

export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Set<GraphEvents>;
        widgetEvents: Set<EventObject>;
    };
}

export class DiagramModel extends Subscribable<DiagramModelEvents> {
    public graph: GraphModel;
    public widgetRegistry: WidgetsModel;
    public selection: Selection;

    private animationFrame: number;
    private graphEvents = new Set<EventObject>();
    private widgetEvents = new Set<EventObject>();

    constructor() {
        super();
        this.graph = new GraphModel();
        this.widgetRegistry = new WidgetsModel();
        this.selection = new Selection({graph: this.graph});

        this.graph.on('add:nodes', this.groupGraphEvents);
        this.graph.on('remove:nodes', this.groupGraphEvents);
        this.graph.on('update:nodes', this.groupGraphEvents);
        this.graph.on('add:links', this.groupGraphEvents);
        this.graph.on('remove:links', this.groupGraphEvents);
        this.graph.on('update:links', this.groupGraphEvents);

        this.widgetRegistry.on('add:widget', this.groupWidgetEvents);
        this.widgetRegistry.on('remove:widget', this.groupWidgetEvents);
        this.widgetRegistry.on('update:widget', this.groupWidgetEvents);
    }

    public get nodes(): ImmutableMap<NodeId, Node> {
        return this.graph.nodes;
    }

    public get links(): ImmutableMap<LinkId, Link> {
        return this.graph.links;
    }

    public performSyncUpdate = () => {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(() => {
            const events = {
                graphEvents: this.graphEvents,
                widgetEvents: this.widgetEvents,
            };
            this.graphEvents = new Set();
            this.widgetEvents = new Set();
            this.trigger('syncupdate', events);
        });
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
