import { GraphModel, ImmutableMap } from './graph/graphModel';
import { Subscribable } from '../utils/subscribable';
import { Node, NodeId } from './graph/node';
import { Link, LinkId } from './graph/link';
import { WidgetsModel } from './widgets/widgetsModel';
import { Selection } from './widgets/selection';
import { Widget } from './widgets/widget';
import { GraphDescriptor } from './graph/graphDescriptor';
export interface NodeEvent<Descriptor extends GraphDescriptor> {
    type: 'add:node' | 'remove:node' | 'update:node';
    target: Node<Descriptor>;
}
export interface LinkEvent<Descriptor extends GraphDescriptor> {
    type: 'add:link' | 'remove:link' | 'update:link';
    target: Link<Descriptor>;
}
export interface WidgetEvent {
    type: 'add:widget' | 'remove:widget' | 'update:widget';
    target: Widget;
}
export interface DiagramEvents<Descriptor extends GraphDescriptor> {
    nodeEvents: ReadonlyArray<NodeEvent<Descriptor>>;
    linkEvents: ReadonlyArray<LinkEvent<Descriptor>>;
    widgetEvents: ReadonlyArray<WidgetEvent>;
}
export interface DiagramModelEvents<Descriptor extends GraphDescriptor> {
    'syncupdate': DiagramEvents<Descriptor>;
}
export declare class DiagramModel<Descriptor extends GraphDescriptor = GraphDescriptor> extends Subscribable<DiagramModelEvents<Descriptor>> {
    graph: GraphModel<Descriptor>;
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
