import * as cola from 'webcola';

import { Link } from '../models/link';
import { Node } from '../models/node';
import { Graph } from './findPath';
import { Vectro3D } from '../models/models';

export interface LayoutNode {
    id: string;
    x: number;
    y: number;
    z: number;
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

export const PUSH_FORCE = 5;

export function riseFieldsLayout(params: {
    nodes: LayoutNode[];
    links: LayoutLink[];
    iterations: number;
    preferredLinkLength: number;
}) {
    let nodes = params.nodes;
    let links = params.links;
    let nodeMap = getNodeMap(nodes);

    // links = links.filter(l => l.source.id !== l.target.id);
    // links = links.concat(completeGraph());

    // const polygons = breakIntoPolygons().map(polygon => polygon.map(nodeId => nodeMap[nodeId]));

    const boostDirections: { [id: string]: Vectro3D[] } = {};
    for (const node of nodes) {
        boostDirections[node.id] = [];
    }

    for (let i = 0; i < params.iterations; i++) {
        // for (const polygon of polygons) {
        //     expandPolygon1(polygon);
        //     expandPolygon2(polygon);
        //     expandPolygon3(polygon, nodes);
        //     pullBorders(polygon);
        // }
        expandPolygon3(nodes, nodes);
        pullBorders2(links);
        for (const node of nodes) {
            const boost = averagePoint(boostDirections[node.id]);
            node.x += boost.x;
            node.y += boost.y;
            node.z += boost.z;
        }
    }

    // Layout functions
    // =====================================

    function expandPolygon1(polygon: LayoutNode[]) {
        const center = averagePoint(polygon);
        const affectiveDistance = (polygon.length * params.preferredLinkLength) / (2 * Math.PI);

        for (const node of polygon) {
            const {deltaSource} = pushTwoPoints(node, center, affectiveDistance);

            boostDirections[node.id].push(deltaSource);
        }
    }

    function expandPolygon2(polygon: LayoutNode[]) {
        const affectiveDistance = (polygon.length * params.preferredLinkLength) / (2 * Math.PI);

        for (let i = 0; i < polygon.length - 1; i++) {
            const source = polygon[i];
            const target = polygon[i + 1];

            const {deltaSource, deltaTarget} = pushTwoPoints(source, target, affectiveDistance);

            boostDirections[source.id].push(deltaSource);
            boostDirections[target.id].push(deltaTarget);
        }
    }

    function expandPolygon3(polygon: LayoutNode[], otherNodes: LayoutNode[]) {
        // const excludedNodes = getNodeMap(polygon);

        for (const node of polygon) {
            for (const otherNode of otherNodes) {
                // if (otherNode !== node || !excludedNodes[otherNode.id]) {
                if (otherNode !== node) {
                    const {deltaSource} = pushTwoPoints(node, otherNode, params.preferredLinkLength);
                    boostDirections[node.id].push(deltaSource);
                }
            }
        }
    }

    function pullBorders(polygon: LayoutNode[]) {
        for (let i = 0; i < polygon.length - 1; i++) {
            const source = polygon[i];
            const target = polygon[i + 1];

            const {deltaSource, deltaTarget} = pullTwoPoints(source, target, params.preferredLinkLength);

            boostDirections[source.id].push(deltaSource);
            boostDirections[target.id].push(deltaTarget);
        }
    }

    function pullBorders2(processedLinks: LayoutLink[]) {
        for (const link of processedLinks) {
            const source = link.source;
            const target = link.target;

            const {deltaSource, deltaTarget} = pullTwoPoints(source, target, params.preferredLinkLength);

            boostDirections[source.id].push(deltaSource);
            boostDirections[target.id].push(deltaTarget);
        }
    }

    function pushTwoPoints(
        source: Vectro3D | LayoutNode,
        target: Vectro3D | LayoutNode,
        affectiveDistance: number
    ) {
        const deltaSource: Vectro3D = {
            x: source.x - target.x || Math.random(),
            y: source.y - target.y || Math.random(),
            z: source.z - target.z || Math.random(),
        };
        const max = Math.max(
            Math.abs(deltaSource.x),
            Math.abs(deltaSource.y),
            Math.abs(deltaSource.z)
        ) || 1;
        const distance = Math.sqrt(
            Math.pow(deltaSource.x, 2) + Math.pow(deltaSource.y, 2) + Math.pow(deltaSource.z, 2)
        ) || 0.001;

        // const modfiyer = affectiveDistance / distance;
        // const modfiyer = Math.max(0, affectiveDistance - distance);
        const limitedDistance = Math.min(distance, affectiveDistance);
        const modfiyer = PUSH_FORCE * Math.pow(affectiveDistance - limitedDistance, 0.5);

        deltaSource.x = (deltaSource.x / max) * modfiyer;
        deltaSource.y = (deltaSource.y / max) * modfiyer;
        deltaSource.z = (deltaSource.z / max) * modfiyer;

        const deltaTarget: Vectro3D = {
            x: -deltaSource.x,
            y: -deltaSource.y,
            z: -deltaSource.z,
        };

        return {
            deltaSource,
            deltaTarget,
        };
    }

    function pullTwoPoints(
        source: Vectro3D | LayoutNode,
        target: Vectro3D | LayoutNode,
        affectiveDistance: number
    ) {
        const deltaTarget: Vectro3D = {
            x: source.x - target.x || Math.random(),
            y: source.y - target.y || Math.random(),
            z: source.z - target.z || Math.random(),
        };
        const max = Math.max(
            Math.abs(deltaTarget.x),
            Math.abs(deltaTarget.y),
            Math.abs(deltaTarget.z)
        ) || 1;
        const distance = Math.sqrt(
            Math.pow(deltaTarget.x, 2) + Math.pow(deltaTarget.y, 2) + Math.pow(deltaTarget.z, 2)
        ) || 0.001;

        // const modfiyer = distance / affectiveDistance;
        // const modfiyer = distance - affectiveDistance;
        const limitedDistance = Math.max(distance, affectiveDistance);
        const modfiyer = PUSH_FORCE * Math.pow(limitedDistance * 2 - affectiveDistance, 0.5);

        deltaTarget.x = (deltaTarget.x / max) * modfiyer;
        deltaTarget.y = (deltaTarget.y / max) * modfiyer;
        deltaTarget.z = (deltaTarget.z / max) * modfiyer;

        const deltaSource: Vectro3D = {
            x: -deltaTarget.x,
            y: -deltaTarget.y,
            z: -deltaTarget.z,
        };

        return {
            deltaSource,
            deltaTarget,
        };
    }

    // Functions helpers
    // =====================================

    function averagePoint(vectors: Vectro3D[]): Vectro3D {
        const center: Vectro3D = { x: 0, y: 0, z: 0 };
        for (const vector of vectors) {
            center.x += vector.x;
            center.y += vector.y;
            center.z += vector.z;
        }
        center.x /= vectors.length;
        center.y /= vectors.length;
        center.z /= vectors.length;

        return center;
    }

    // Preparing graph functions
    // =====================================

    function breakIntoPolygons() {
        const graph = createGraph({ nodes, links });

        const polygonsMap: { [id: string]: string[] } = {};
        for (const node of params.nodes) {
            const neighbours =  Object.keys(graph.getVertex(node.id) || {});
            const localRules: { [id: string]: { [target: string]: number } }  = {};
            for (const neighbour of neighbours) {
                if (!localRules[neighbour]) { localRules[neighbour] = {}; }
                localRules[neighbour][node.id] = Infinity;
                if (!localRules[node.id]) { localRules[node.id] = {}; }
                localRules[node.id][neighbour] = Infinity;
            }

            let pathes = [];
            for (let i = 0; i < neighbours.length; i++) {
                const sourceId = i === 0 ? neighbours[neighbours.length - 1] : neighbours[i];
                const targetId = neighbours[i];
                const path = graph.shortestPath(sourceId, targetId, localRules);
                if (path.length > 1) {
                    const fullPath = [node.id].concat(path);
                    pathes.push(fullPath);
                }
            }

            for (const path of pathes) {
                const pathId = path.sort((a, b) => {
                    if (a > b) {
                        return 1;
                    } else if (a < b) {
                        return -1;
                    } else {
                        return 0;
                    }
                }).join(':');
                polygonsMap[pathId] = path;
            }
        }
        const ids = Object.keys(polygonsMap);

        return ids.map(id => polygonsMap[id]);
    }

    function completeGraph() {
        const graph = createGraph(params);
        const terminations: LayoutNode[] = [];

        for (const node of params.nodes) {
            const neighbours = Object.keys(graph.getVertex(node.id) || {});
            if (neighbours.length === 1) {
                terminations.push(node);
            }
        }

        const processedIds: { [target: string]: number } = {};
        const distanceMap: { [id: string]: { [target: string]: string[] } } = {};
        for (let i = 0; i < terminations.length; i++) {
            const source = terminations[i];
            if (!distanceMap[source.id]) {
                distanceMap[source.id] = {};
            }
            for (let j = i; j < terminations.length; j++) {
                const target = terminations[j];
                if (!distanceMap[target.id]) {
                    distanceMap[target.id] = {};
                }
                const path = graph.shortestPath(source.id, target.id);
                distanceMap[source.id][target.id] = path;
                distanceMap[target.id][source.id] = path;
            }
            processedIds[source.id] = 0;
        }

        const extraLinks: LayoutLink[] = [];
        for (const node of terminations) {
            if (processedIds[node.id] < 2) {
                const pathes = Object.keys(distanceMap[node.id])
                    .map(key => {
                        const nodes = distanceMap[node.id][key];
                        const path = {
                            target: key,
                            nodes: nodes,
                            length: nodes.length === 0 ? Infinity : nodes.length,
                        };
                        return path;
                    })
                    .sort((a, b) => {
                        if (a.length > b.length) {
                            return 1;
                        } else if (a.length < b.length) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                for (const path of pathes) {
                    if (processedIds[node.id] >= 2) {
                        break;
                    }
                    if (processedIds[path.target] < 2 && node.id !== path.target) {
                        processedIds[path.target]++;
                        processedIds[node.id]++;
                        extraLinks.push({
                            originalLink: undefined,
                            source: nodeMap[node.id],
                            target: nodeMap[path.target],
                        });
                    }
                }
            }
        }

        return extraLinks;
    }

    function createGraph(parameters: {
        nodes: LayoutNode[];
        links: LayoutLink[];
    }): Graph {
        const graph = new Graph();
        const vertices: { [id: string]: { [target: string]: number } } = {};

        for (const link of parameters.links) {
            if (!vertices[link.source.id]) {
                vertices[link.source.id] = {};
            }
            vertices[link.source.id][link.target.id] = 1;
            if (!vertices[link.target.id]) {
                vertices[link.target.id] = {};
            }
            vertices[link.target.id][link.source.id] = 1;
        }

        for (const node of parameters.nodes) {
            graph.addVertex(node.id, vertices[node.id]);
        }

        return graph;
    }

    function getNodeMap(nodeList: LayoutNode[]): { [id: string]: LayoutNode } {
        const map: { [id: string]: LayoutNode } = {};
        for (const node of nodeList) {
            map[node.id] = node;
        }
        return map;
    }
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
