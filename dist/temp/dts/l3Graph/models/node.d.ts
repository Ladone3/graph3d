import { Vector3D } from './primitives';
import { Subscribable } from '../utils/subscribeable';
import { Link } from './link';
export declare const DEFAULT_NODE_TYPE_ID = "o3d-node";
export declare const DEFAULT_NODE_SIZE: Vector3D;
export interface NodeParameters<NodeContent> {
    id?: string;
    position: Vector3D;
    types?: string[];
    data?: NodeContent;
}
export interface NodeEvents {
    'change:position': Vector3D;
    'force-update': void;
    'remove': void;
}
export declare class Node<NodeContent = any> extends Subscribable<NodeEvents> {
    readonly id: string;
    incomingLinks: Map<string, Link>;
    outgoingLinks: Map<string, Link>;
    private _data;
    private _types;
    private _position;
    constructor(parameters: NodeParameters<NodeContent>);
    types: string[];
    data: NodeContent;
    position: Vector3D;
    forceUpdate(): void;
    remove(): void;
}
