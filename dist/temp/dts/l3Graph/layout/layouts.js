"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cola = require("webcola");
var utils_1 = require("../utils");
exports.PREFFERED_LINK_LENGTH = 75;
var LayoutNode3D = /** @class */ (function (_super) {
    tslib_1.__extends(LayoutNode3D, _super);
    function LayoutNode3D(node) {
        var _this = _super.call(this, node.position.x, node.position.y, node.position.z) || this;
        _this.node = node;
        return _this;
    }
    return LayoutNode3D;
}(cola.Node3D));
exports.LayoutNode3D = LayoutNode3D;
var LayoutLink3D = /** @class */ (function (_super) {
    tslib_1.__extends(LayoutLink3D, _super);
    function LayoutLink3D(link, sourceIndex, targetIndex) {
        var _this = _super.call(this, sourceIndex, targetIndex) || this;
        _this.link = link;
        return _this;
    }
    return LayoutLink3D;
}(cola.Link3D));
exports.LayoutLink3D = LayoutLink3D;
function whaterHoleLayout(params) {
    // ...
}
exports.whaterHoleLayout = whaterHoleLayout;
function forceLayout(params) {
    var layout = new cola.Layout()
        .nodes(params.nodes)
        .links(params.links)
        .convergenceThreshold(1e-9)
        .jaccardLinkLengths(params.preferredLinkLength)
        .handleDisconnected(true);
    layout.start(params.iterations, 0, params.iterations / 3, undefined, false);
}
exports.forceLayout = forceLayout;
function forceLayout3d(params) {
    var layout = new cola.Layout3D(params.nodes, params.links, params.preferredLinkLength);
    layout.start(params.iterations);
    params.nodes.forEach(function (node, index) {
        node.x = layout.result[0][index];
        node.y = layout.result[1][index];
        node.z = layout.result[2][index];
    });
}
exports.forceLayout3d = forceLayout3d;
function flowLayout(params) {
    var layout = new cola.Layout()
        .flowLayout('y', 300)
        .nodes(params.nodes)
        .links(params.links)
        .convergenceThreshold(1e-9)
        .jaccardLinkLengths(params.preferredLinkLength)
        .handleDisconnected(true);
    layout.start(params.iterations, 0, params.iterations / 3, undefined, false);
}
exports.flowLayout = flowLayout;
function applyForceLayout(graph) {
    var nodes = graph.nodes, links = graph.links;
    var proccessMap = {};
    var layoutNodes = [];
    nodes.forEach(function (node) {
        var position = node.position;
        var size = { x: exports.PREFFERED_LINK_LENGTH / 5, y: exports.PREFFERED_LINK_LENGTH / 5 };
        var layoutNode = {
            id: node.id,
            x: position.x,
            y: position.y,
            width: size.x,
            height: size.y,
            originalNode: node,
        };
        proccessMap[layoutNode.id] = layoutNode;
        layoutNodes.push(layoutNode);
    });
    var layoutLinks = [];
    links.forEach(function (link) {
        layoutLinks.push({
            originalLink: link,
            source: proccessMap[link.source.id],
            target: proccessMap[link.target.id],
        });
    });
    forceLayout({
        nodes: layoutNodes,
        links: layoutLinks,
        iterations: 1,
        preferredLinkLength: 300,
    });
    for (var _i = 0, layoutNodes_1 = layoutNodes; _i < layoutNodes_1.length; _i++) {
        var layoutNode = layoutNodes_1[_i];
        var node = layoutNode.originalNode;
        var nodePos = node.position;
        node.position = {
            x: layoutNode.x,
            y: layoutNode.y,
            z: Math.round(nodePos.z / 2),
        };
    }
}
exports.applyForceLayout = applyForceLayout;
function applyRandomLayout(graph, maxDist) {
    if (maxDist === void 0) { maxDist = 500; }
    var nodes = graph.nodes;
    var positions = [];
    for (var i = 0; i < nodes.size; i++) {
        positions.push({
            x: Math.round(Math.random() * maxDist),
            y: Math.round(Math.random() * maxDist),
            z: Math.round(Math.random() * maxDist),
        });
    }
    var average = utils_1.calcBounds(positions).average;
    var index = 0;
    nodes.forEach(function (node) {
        var pos = positions[index++];
        node.position = {
            x: pos.x - average.x,
            y: pos.y - average.y,
            z: pos.z - average.z,
        };
    });
}
exports.applyRandomLayout = applyRandomLayout;
function applyForceLayout3d(graph, iterations, linkLength) {
    if (iterations === void 0) { iterations = 1; }
    if (linkLength === void 0) { linkLength = exports.PREFFERED_LINK_LENGTH; }
    var nodes = graph.nodes, links = graph.links;
    var proccessMap = {};
    var layoutNodes = [];
    var counter = 0;
    nodes.forEach(function (node, index) {
        var layoutNode = new LayoutNode3D(node);
        proccessMap[layoutNode.node.id] = counter++;
        layoutNodes.push(layoutNode);
    });
    var layoutLinks = [];
    links.forEach(function (link) {
        layoutLinks.push(new LayoutLink3D(link, proccessMap[link.source.id], proccessMap[link.target.id]));
    });
    forceLayout3d({
        nodes: layoutNodes,
        links: layoutLinks,
        iterations: iterations || 1,
        preferredLinkLength: linkLength || exports.PREFFERED_LINK_LENGTH,
    });
    var average = utils_1.calcBounds(layoutNodes).average;
    for (var _i = 0, layoutNodes_2 = layoutNodes; _i < layoutNodes_2.length; _i++) {
        var layoutNode = layoutNodes_2[_i];
        var node = layoutNode.node;
        node.position = {
            x: layoutNode.x - average.x,
            y: layoutNode.y - average.y,
            z: layoutNode.z - average.z,
        };
    }
}
exports.applyForceLayout3d = applyForceLayout3d;
