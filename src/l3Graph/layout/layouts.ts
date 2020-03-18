import * as cola from 'webcola';

import { Link } from '../models/graph/link';
import { Node, NodeId } from '../models/graph/node';
import { GraphModel } from '../models/graph/graphModel';
import { calcBounds } from '../utils';
import { Vector3d } from '../models/structures';

export const PREFERRED_LINK_LENGTH = 75;

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
            node.position.x,
            node.position.y,
            node.position.z
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

export function applyForceLayout(graph: GraphModel) {
    const { nodes, links } = graph;
    const processMap = new Map<string, LayoutNode>();

    const layoutNodes: LayoutNode[] = [];
    nodes.forEach(node => {
        const position = node.position;
        const size = { x: PREFERRED_LINK_LENGTH / 5, y: PREFERRED_LINK_LENGTH / 5 };

        const layoutNode = {
            id: node.id as string,
            x: position.x,
            y: position.y,
            width: size.x,
            height: size.y,
            originalNode: node,
        };

        processMap.set(layoutNode.id, layoutNode);
        layoutNodes.push(layoutNode);
    });

    const layoutLinks: LayoutLink[] = [];
    links.forEach(link => {
        layoutLinks.push({
            originalLink: link,
            source: processMap.get(link.source.id as string),
            target: processMap.get(link.target.id as string),
        });
    });

    forceLayout({
        nodes: layoutNodes,
        links: layoutLinks,
        iterations: 1,
        preferredLinkLength: 300,
    });

    for (const layoutNode of layoutNodes) {
        const node = layoutNode.originalNode;
        const nodePos = node.position;

        node.setPosition({
            x: layoutNode.x,
            y: layoutNode.y,
            z: Math.round(nodePos.z / 2),
        });
    }
}

export function applyForceLayout3d(
    graph: GraphModel, iterations: number = 1, linkLength: number = PREFERRED_LINK_LENGTH,
) {
    const { nodes, links } = graph;
    const processMap = new Map<NodeId, number>();
    const layoutNodes: LayoutNode3D[] = [];

    let counter = 0;
    nodes.forEach((node, index) => {
        const layoutNode = new LayoutNode3D(node);

        processMap.set(layoutNode.node.id, counter++);
        layoutNodes.push(layoutNode);
    });

    const layoutLinks: LayoutLink3D [] = [];
    links.forEach(link => {
        layoutLinks.push(new LayoutLink3D(
            link,
            processMap.get(link.source.id),
            processMap.get(link.target.id),
        ));
    });

    forceLayout3d ({
        nodes: layoutNodes,
        links: layoutLinks,
        iterations: iterations || 1,
        preferredLinkLength: linkLength || PREFERRED_LINK_LENGTH,
    });

    const {average} = calcBounds(layoutNodes);

    for (const layoutNode of layoutNodes) {
        const node = layoutNode.node;

        node.setPosition({
            x: layoutNode.x - average.x,
            y: layoutNode.y - average.y,
            z: layoutNode.z - average.z,
        });
    }
}
