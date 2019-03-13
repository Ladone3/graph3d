import { GraphModel, ImmutableMap } from './graph/graphModel';
import { Subscribable, EventObject } from '../utils/subscribable';
import { Node, NodeId } from './graph/node';
import { Link, LinkId } from './graph/link';
import { WidgetsModel } from './widgets/widgetsModel';
import { Selection } from './widgets/selection';
declare type GraphEvents = EventObject<'add:nodes', Node[]> | EventObject<'remove:nodes', Node[]> | EventObject<'update:nodes', Node[]> | EventObject<'add:links', Link[]> | EventObject<'remove:links', Link[]> | EventObject<'update:links', Link[]>;
export interface DiagramModelEvents {
    'syncupdate': {
        graphEvents: Set<GraphEvents>;
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
    readonly nodes: ImmutableMap<NodeId, Node>;
    readonly links: ImmutableMap<LinkId, Link>;
    performSyncUpdate: () => void;
    private groupGraphEvents;
    private groupWidgetEvents;
}
export {};
