import * as cola from 'webcola';
import { Link } from '../models/link';
import { Node } from '../models/node';
import { GraphModel } from '../models/graphModel';
export declare const PREFFERED_LINK_LENGTH = 75;
export interface LayoutNode {
    id?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    originalNode: Node;
    bounds?: any;
    innerBounds?: any;
}
export interface LayoutLink {
    originalLink: Link;
    source: LayoutNode;
    target: LayoutNode;
}
export declare class LayoutNode3D extends cola.Node3D {
    node: Node;
    constructor(node: Node);
}
export declare class LayoutLink3D extends cola.Link3D {
    link: Link;
    constructor(link: Link, sourceIndex: number, targetIndex: number);
}
export interface LayoutLink {
    originalLink: Link;
    source: LayoutNode;
    target: LayoutNode;
}
export declare function whaterHoleLayout(params: {
    nodes: LayoutNode[];
    links: LayoutLink[];
}): void;
export declare function forceLayout(params: {
    iterations: number;
    nodes: LayoutNode[];
    links: LayoutLink[];
    preferredLinkLength: number;
}): void;
export declare function forceLayout3d(params: {
    iterations: number;
    nodes: cola.Node3D[];
    links: cola.Link3D[];
    preferredLinkLength: number;
}): void;
export declare function flowLayout(params: {
    iterations: number;
    nodes: LayoutNode[];
    links: LayoutLink[];
    preferredLinkLength: number;
}): void;
export declare function applyForceLayout(graph: GraphModel): void;
export declare function applyRandomLayout(graph: GraphModel, maxDist?: number): void;
export declare function applyForceLayout3d(graph: GraphModel, iterations?: number, linkLength?: number): void;
