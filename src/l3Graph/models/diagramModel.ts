import { Element, GraphModel } from './graphModel';
import { Subscribable, EventObject } from '../utils/subscribeable';
import { Node } from '../models/node';
import { Link } from '../models/link';
import { Widget } from './widget';
import { WidgetsModel } from './widgetsModel';

export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Map<string, Element>;
        widgetEvents: Map<string, Widget>;
    };
}

export class DiagramModel extends Subscribable<DiagramModelEvents> {
    public graph: GraphModel;
    public widgets: WidgetsModel;
    private animationFrame: number;

    private graphEvents: Map<string, Element> = new Map();
    private widgetEvents: Map<string, Widget> = new Map();

    constructor() {
        super();
        this.graph = new GraphModel();
        this.widgets = new WidgetsModel();
        this.graph.on('change:element', this.onElementUpdate);
        this.widgets.on('widget:update', this.onWidgetUpdate);
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

    private onElementUpdate = (event: EventObject<'change:element', Element>) => {
        const element = event.data;
        this.graphEvents.set(element.id, element);
        this.performSyncUpdate();
    }

    private onWidgetUpdate = (event: EventObject<'widget:update', Widget>) => {
        const widget = event.data;
        this.widgetEvents.set(widget.widgetId, widget);
        this.performSyncUpdate();
    }

    public performSyncUpdate = () => {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(() => {
            const events = {
                graphEvents: this.graphEvents,
                widgetEvents: this.widgetEvents,
            };
            this.graphEvents = new Map();
            this.widgetEvents = new Map();
            this.trigger('syncupdate', events);
        });
    }
}
