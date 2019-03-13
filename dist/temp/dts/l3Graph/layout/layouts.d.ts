import * as cola from 'webcola';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
import { GraphModel } from '../models/graph/graphModel';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export declare const PREFERRED_LINK_LENGTH = 75;
export interface LayoutNode<Descriptor extends GraphDescriptor> {
    id?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    originalNode: Node<Descriptor>;
    bounds?: any;
    innerBounds?: any;
}
export interface LayoutLink<Descriptor extends GraphDescriptor> {
    originalLink: Link<Descriptor>;
    source: LayoutNode<Descriptor>;
    target: LayoutNode<Descriptor>;
}
export declare class LayoutNode3D<Descriptor extends GraphDescriptor> extends cola.Node3D {
    node: Node<Descriptor>;
    constructor(node: Node<Descriptor>);
}
export declare class LayoutLink3D<Descriptor extends GraphDescriptor> extends cola.Link3D {
    link: Link<Descriptor>;
    constructor(link: Link<Descriptor>, sourceIndex: number, targetIndex: number);
}
export declare function forceLayout<Descriptor extends GraphDescriptor>(params: {
    iterations: number;
    nodes: LayoutNode<Descriptor>[];
    links: LayoutLink<Descriptor>[];
    preferredLinkLength: number;
}): void;
export declare function forceLayout3d(params: {
    iterations: number;
    nodes: cola.Node3D[];
    links: cola.Link3D[];
    preferredLinkLength: number;
}): void;
export declare function flowLayout<Descriptor extends GraphDescriptor>(params: {
    iterations: number;
    nodes: LayoutNode<Descriptor>[];
    links: LayoutLink<Descriptor>[];
    preferredLinkLength: number;
}): void;
export declare function applyForceLayout<Descriptor extends GraphDescriptor>(graph: GraphModel<Descriptor>): void;
export declare function applyForceLayout3d<Descriptor extends GraphDescriptor>(graph: GraphModel<Descriptor>, iterations?: number, linkLength?: number): void;
