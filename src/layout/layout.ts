import * as cola from 'webcola';

import { Link } from '../models/link';
import { Node } from '../models/node';

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

export class LayoutNode3D extends cola.Node3D {
    constructor(public node: Node) {
        super(
            node.getPosition().x,
            node.getPosition().y,
            node.getPosition().z
        );
    }
}

export class LayoutLink3D extends cola.Link3D {
    constructor(
        public link: Link,
        sourceIndex: number,
        targetIndex: number,
    ) {
        super(sourceIndex, targetIndex);
    }
}

export interface LayoutLink {
    originalLink: Link;
    source: LayoutNode;
    target: LayoutNode;
}

export function whaterHoleLayout(params: {
    nodes: LayoutNode[];
    links: LayoutLink[];
}) {
    // ...
}

export function forceLayout(params: {
    iterations: number;
    nodes: LayoutNode[];
    links: LayoutLink[];
    preferredLinkLength: number;
}) {
    const layout = new cola.Layout()
        .nodes(params.nodes)
        .links(params.links)
        .convergenceThreshold(1e-9)
        .jaccardLinkLengths(params.preferredLinkLength)
        .handleDisconnected(true);
    layout.start(params.iterations, 0, params.iterations / 3, undefined, false);
}

export function forceLayout3d(params: {
    iterations: number;
    nodes: cola.Node3D[];
    links: cola.Link3D[];
    preferredLinkLength: number;
}) {
    const layout = new cola.Layout3D(
        params.nodes,
        params.links,
        params.preferredLinkLength,
    );
    layout.start(params.iterations);
    params.nodes.forEach((node, index) => {
        node.x = layout.result[0][index];
        node.y = layout.result[1][index];
        node.z = layout.result[2][index];
    });
}

export function flowLayout(params: {
    iterations: number;
    nodes: LayoutNode[];
    links: LayoutLink[];
    preferredLinkLength: number;
}) {
    const layout = new cola.Layout()
        .flowLayout('y', 300)
        .nodes(params.nodes)
        .links(params.links)
        .convergenceThreshold(1e-9)
        .jaccardLinkLengths(params.preferredLinkLength)
        .handleDisconnected(true);
    layout.start(params.iterations, 0, params.iterations / 3, undefined, false);
}
