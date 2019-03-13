import { Vector3d, Size } from '../structures';
import { Link } from './link';
import { PointEvents, Point, PointParameters, PointId } from '../point';
import { GraphDescriptor } from './graphDescriptor';
export declare type NodeId = PointId & {
    nodePlaceholder?: boolean;
};
export interface NodeModel<NodeContent> {
    id: NodeId;
    data?: NodeContent;
}
export interface NodeParameters extends PointParameters {
    size?: Size;
}
export interface NodeEvents extends PointEvents {
    'change:size': Vector3d;
    'force-update': void;
}
export declare class Node<Descriptor extends GraphDescriptor> extends Point<NodeEvents> {
    private _model;
    incomingLinks: Set<Link<Descriptor>>;
    outgoingLinks: Set<Link<Descriptor>>;
    modelIsChanged: boolean;
    private _size;
    readonly id: NodeId;
    constructor(_model: NodeModel<Descriptor['nodeContentType']>, parameters?: NodeParameters);
    readonly data: Descriptor["nodeContentType"];
    setData(data: Descriptor['nodeContentType']): void;
    readonly model: NodeModel<Descriptor['nodeContentType']>;
    readonly size: Size;
    setSize(size: Size): void;
    forceUpdate(): void;
}
