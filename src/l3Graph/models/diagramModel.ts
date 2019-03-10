import { Element, GraphModel } from './graphModel';
import { Subscribable, EventObject } from '../utils/subscribeable';
import { Node } from '../models/node';
import { Link } from '../models/link';
import { Widget } from './widget';
import { WidgetsModel } from './widgetsModel';
import { Selection } from './selection';

export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Set<EventObject>;
        widgetEvents: Set<EventObject>;
    };
    'change:selection': Set<Element>;
}

export class DiagramModel extends Subscribable<DiagramModelEvents> {
    public graph: GraphModel;
    public widgets: WidgetsModel;
    private deprecatedSelection: Set<Element> = new Set();
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
