import { Element, GraphModel } from './graphModel';
import { Subscribable, EventObject } from '../utils/subscribeable';
import { Node } from '../models/node';
import { Link } from '../models/link';
import { Widget } from './widget';
import { WidgetsModel } from './widgetsModel';
import { Selection } from './selection';

export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Map<string, Element>;
        widgetEvents: Map<string, Widget>;
    };
    'change:selection': Set<Element>;
}

export class DiagramModel extends Subscribable<DiagramModelEvents> {
    public graph: GraphModel;
    public widgets: WidgetsModel;
    private deprecatedSelection: Set<Element> = new Set();
    private animationFrame: number;

    private graphEvents: Map<string, Element> = new Map();
    private widgetEvents: Map<string, Widget> = new Map();

    private _selection: Selection;

    constructor() {
        super();
        this.graph = new GraphModel();
        this.widgets = new WidgetsModel();
        this.initSelectionWidget();
        this.graph.on('change:element', this.onElementUpdate);
        this.widgets.on('widget:update', this.onWidgetUpdate);
    }

    public get selection(): Set<Element> {
        return this._selection.selection;
    }

    public set selection(newSelection: Set<Element>) {
        const oldSelection = this._selection.selection;
        this._selection.selection = newSelection;
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

    public updateElements(elements: Element[]) {
        this.graph.updateElements(elements);
    }

    public performSyncUpdate = () => {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(() => {
            const events = {
                graphEvents: this.graphEvents,
                widgetEvents: this.widgetEvents,
                deprecatedSelection: this.deprecatedSelection,
            };
            this.graphEvents = new Map();
            this.widgetEvents = new Map();
            this.trigger('syncupdate', events);
        });
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

    private initSelectionWidget() {
        this._selection = new Selection();
        this.widgets.registerWidget(this._selection);
    }
}
