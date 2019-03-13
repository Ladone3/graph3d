import { GraphModel, ImmutableMap } from './graph/graphModel';
import { Subscribable } from '../utils/subscribable';
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
export declare class DiagramModel extends Subscribable<DiagramModelEvents> {
    graph: GraphModel;
    widgetRegistry: WidgetsModel;
    selection: Selection;
    private animationFrame;
    private nodeEvents;
    private linkEvents;
    private widgetEvents;
    constructor();
    readonly nodes: ImmutableMap<NodeId, Node>;
    readonly links: ImmutableMap<LinkId, Link>;
    performSyncUpdate: () => void;
    private onNodeEvent;
    private onLinkEvent;
    private onWidgetEvent;
}
