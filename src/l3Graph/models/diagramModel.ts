import { GraphModel, ImmutableMap, NodeDefinition, ElementModel } from './graph/graphModel';
import { Subscribable, EventObject } from '../utils/subscribable';
import { Node, NodeId } from './graph/node';
import { Link, LinkId } from './graph/link';
import { WidgetsModel } from './widgets/widgetsModel';
import { Selection } from './widgets/selection';
import { Widget } from './widgets/widget';

export interface NodeEvent {
    type: 'add:node' | 'remove:node' | 'update:node';
    target: Node;
}

export interface LinkEvent {
    type: 'add:link' | 'remove:link' | 'update:link';
    target: Link;
}

export interface WidgetEvent {
    type: 'add:widget' | 'remove:widget' | 'update:widget';
    target: Widget;
}

export interface DiagramEvents {
    nodeEvents: ReadonlyArray<NodeEvent>;
    linkEvents: ReadonlyArray<LinkEvent>;
    widgetEvents: ReadonlyArray<WidgetEvent>;
}

export interface DiagramModelEvents {
    'syncupdate': DiagramEvents;
}

const mapEvent = new Map();
mapEvent.set('add:nodes', 'add:node');
mapEvent.set('update:nodes', 'update:node');
mapEvent.set('remove:nodes', 'remove:node');
mapEvent.set('add:links', 'add:link');
mapEvent.set('update:links', 'update:link');
mapEvent.set('remove:links', 'remove:link');

export class DiagramModel extends Subscribable<DiagramModelEvents> {
    public graph: GraphModel;
    public widgetRegistry: WidgetsModel;
    public selection: Selection;

    private animationFrame: number;
    private nodeEvents = new Map<Node, NodeEvent>();
    private linkEvents = new Map<Link, LinkEvent>();
    private widgetEvents = new Map<Widget, WidgetEvent>();

    constructor() {
        super();
        this.graph = new GraphModel();
        this.widgetRegistry = new WidgetsModel();
        this.selection = new Selection({graph: this.graph});

        this.graph.on('add:nodes', this.onNodeEvent);
        this.graph.on('remove:nodes', this.onNodeEvent);
        this.graph.on('update:nodes', this.onNodeEvent);
        this.graph.on('add:links', this.onLinkEvent);
        this.graph.on('remove:links', this.onLinkEvent);
        this.graph.on('update:links', this.onLinkEvent);

        this.widgetRegistry.on('add:widget', this.onWidgetEvent);
        this.widgetRegistry.on('remove:widget', this.onWidgetEvent);
        this.widgetRegistry.on('update:widget', this.onWidgetEvent);
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
            const events: DiagramEvents = {
                nodeEvents: Array.from(this.nodeEvents.values()),
                linkEvents: Array.from(this.linkEvents.values()),
                widgetEvents: Array.from(this.widgetEvents.values()),
            };
            this.nodeEvents = new Map();
            this.linkEvents = new Map();
            this.widgetEvents = new Map();
            this.trigger('syncupdate', events);
        });
    }

    private onNodeEvent = (event: EventObject<any, Node[]>) => {
        for (const model of event.data) {
            const oldEvent = this.nodeEvents.get(model);
            const eventType = mapEvent.get(event.eventId);
            if (oldEvent) {
                if (eventType === 'add:node' && oldEvent.type === 'remove:node') {
                    this.nodeEvents.set(model, {type: 'update:node', target: model});
                } else if (eventType === 'remove:node') {
                    if (oldEvent.type === 'add:node') {
                        this.nodeEvents.delete(model);
                    } else {
                        this.nodeEvents.set(model, {type: eventType, target: model});
                    }
                }
            } else {
                this.nodeEvents.set(model, {type: eventType, target: model});
            }
        }
        this.performSyncUpdate();
    }

    private onLinkEvent = (event: EventObject<any, Link[]>) => {
        for (const model of event.data) {
            const oldEvent = this.linkEvents.get(model);
            const eventType = mapEvent.get(event.eventId);
            if (oldEvent) {
                if (eventType === 'add:link' && oldEvent.type === 'remove:link') {
                    this.linkEvents.set(model, {type: 'update:link', target: model});
                } else if (eventType === 'remove:link') {
                    if (oldEvent.type === 'add:link') {
                        this.linkEvents.delete(model);
                    } else {
                        this.linkEvents.set(model, {type: eventType, target: model});
                    }
                }
            } else {
                this.linkEvents.set(model, {type: eventType, target: model});
            }
        }
        this.performSyncUpdate();
    }

    private onWidgetEvent = (event: EventObject<any, Widget>) => {
        const oldEvent = this.widgetEvents.get(event.data);
        const eventType = event.eventId;
        if (oldEvent) {
            if (eventType === 'add:widget' && oldEvent.type === 'remove:widget') {
                this.widgetEvents.set(event.data, {type: 'update:widget', target: event.data});
            } else if (eventType === 'remove:widget') {
                if (oldEvent.type === 'add:widget') {
                    this.widgetEvents.delete(event.data);
                } else {
                    this.widgetEvents.set(event.data, {type: eventType, target: event.data});
                }
            }
        } else {
            this.widgetEvents.set(event.data, {type: eventType, target: event.data});
        }

        this.performSyncUpdate();
    }
}
