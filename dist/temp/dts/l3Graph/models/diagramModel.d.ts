import { Element, GraphModel } from './graphModel';
import { Subscribable, EventObject } from '../utils/subscribeable';
import { Node } from '../models/node';
import { Link } from '../models/link';
import { WidgetsModel } from './widgetsModel';
export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Set<EventObject>;
        widgetEvents: Set<EventObject>;
    };
    'change:selection': Set<Element>;
}
export declare class DiagramModel extends Subscribable<DiagramModelEvents> {
    graph: GraphModel;
    widgets: WidgetsModel;
    private deprecatedSelection;
    private animationFrame;
    private graphEvents;
    private widgetEvents;
    private _selection;
    constructor();
    selection: Set<Element>;
    readonly nodes: Map<string, Node>;
    readonly links: Map<string, Link>;
    addElements(elements: Element[]): void;
    removeElements(elements: Element[]): void;
    removeNodesByIds(nodeIds: string[]): void;
    removeLinksByIds(linkIds: string[]): void;
    updateElements(elements: Element[]): void;
    performSyncUpdate: () => void;
    private groupGraphEvents;
    private groupWidgetEvents;
    private initSelectionWidget();
}
