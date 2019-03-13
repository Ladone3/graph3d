import { Vector3d } from '../structures';
import { Link } from './link';
import { PointEvents, Point, PointParameters } from '../point';
export declare type Size = Vector3d & {
    placeholder?: boolean;
};
export interface NodeModel<NodeContent = any> {
    id: string;
    data?: NodeContent;
}
export interface NodeParameters extends PointParameters {
    size?: Size;
}
export interface NodeEvents extends PointEvents {
    'change:size': Vector3d;
    'force-update': void;
}
export declare class Node<NodeContent = any> extends Point<NodeEvents> {
    private _model;
    incomingLinks: Set<Link>;
    outgoingLinks: Set<Link>;
    modelIsChanged: boolean;
    private _size;
    readonly id: string;
    constructor(_model: NodeModel<NodeContent>, parameters?: NodeParameters);
    readonly data: NodeContent;
    setData(data: NodeContent): void;
    readonly model: NodeModel<NodeContent>;
    readonly size: Size;
    setSize(size: Size): void;
    forceUpdate(): void;
}
