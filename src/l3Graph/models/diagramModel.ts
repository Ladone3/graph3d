import { GraphModel, ImmutableMap, NodeDefinition, ElementModel } from './graph/graphModel';
import { Subscribable, EventObject } from '../utils/subscribeable';
import { Node } from './graph/node';
import { Link } from './graph/link';
import { WidgetsModel } from './widgets/widgetsModel';
import { Selection } from './widgets/selection';

export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Set<EventObject>;
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

        this.graph.on('add:elements', this.groupGraphEvents);
        this.graph.on('remove:elements', this.groupGraphEvents);
        this.graph.on('update:element', this.groupGraphEvents);

        this.widgetRegistry.on('add:widget', this.groupWidgetEvents);
        this.widgetRegistry.on('remove:widget', this.groupWidgetEvents);
        this.widgetRegistry.on('update:widget', this.groupWidgetEvents);
    }

    public get nodes(): ImmutableMap<string, Node> {
        return this.graph.nodes;
    }

    public get links(): ImmutableMap<string, Link> {
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
