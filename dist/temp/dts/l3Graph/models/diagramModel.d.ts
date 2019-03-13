import { GraphModel, ImmutableMap } from './graph/graphModel';
import { Subscribable, EventObject } from '../utils/subscribable';
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
export declare class DiagramModel extends Subscribable<DiagramModelEvents> {
    graph: GraphModel;
    widgetRegistry: WidgetsModel;
    selection: Selection;
    private animationFrame;
    private graphEvents;
    private widgetEvents;
    constructor();
    readonly nodes: ImmutableMap<string, Node>;
    readonly links: ImmutableMap<string, Link>;
    performSyncUpdate: () => void;
    private groupGraphEvents;
    private groupWidgetEvents;
}
