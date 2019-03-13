import { Element, GraphModel } from './graphModel';
import { Subscribable } from '../utils/subscribeable';
import { Node } from '../models/node';
import { Link } from '../models/link';
import { Widget } from './widget';
import { WidgetsModel } from './widgetsModel';
export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Map<string, Element>;
        widgetEvents: Map<string, Widget>;
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
    private onElementUpdate;
    private onWidgetUpdate;
    private initSelectionWidget();
}
