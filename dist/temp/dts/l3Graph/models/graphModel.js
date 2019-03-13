"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var node_1 = require("./node");
var link_1 = require("./link");
var subscribeable_1 = require("../utils/subscribeable");
function isNode(element) {
    return element instanceof node_1.Node;
}
exports.isNode = isNode;
function isLink(element) {
    return element instanceof link_1.Link;
}
exports.isLink = isLink;
var GraphModel = /** @class */ (function (_super) {
    tslib_1.__extends(GraphModel, _super);
    function GraphModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodes = new Map();
        _this.links = new Map();
        _this.fullUpdateList = new Set();
        return _this;
    }
    GraphModel.prototype.getElementById = function (id) {
        return this.nodes.get(id) || this.links.get(id);
    };
    GraphModel.prototype.addElements = function (elements) {
        var newElements = [];
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (isNode(element) && !this.nodes.has(element.id)) {
                this.nodes.set(element.id, element);
                this.subscribeOnNode(element);
                newElements.push(element);
            }
            else if (isLink(element) && !this.links.has(element.id)) {
                element.source = this.nodes.get(element._sourceId);
                element.target = this.nodes.get(element._targetId);
                if (element.source && element.target) {
                    this.links.set(element.id, element);
                    element.source.outgoingLinks.set(element.id, element);
                    element.target.incomingLinks.set(element.id, element);
                    this.subscribeOnLink(element);
                    newElements.push(element);
                }
            }
        }
        this.trigger('add:elements', newElements);
    };
    GraphModel.prototype.updateElements = function (elements) {
        for (var _i = 0, elements_2 = elements; _i < elements_2.length; _i++) {
            var element = elements_2[_i];
            this.fullUpdateList.add(element.id);
            if (isNode(element)) {
                var node = this.nodes.get(element.id);
                node.data = element.data;
                node.types = element.types;
            }
            else {
                var link = this.links.get(element.id);
                link.types = element.types;
                link.label = element.label;
            }
        }
    };
    GraphModel.prototype.subscribeOnNode = function (element) {
        var _this = this;
        element.on('force-update', function (event) { return _this.performNodeUpdate(element); });
        element.on('change:position', function (event) { return _this.performNodeUpdate(element); });
        element.on('remove', function (event) { return _this.removeElements([element]); });
    };
    GraphModel.prototype.subscribeOnLink = function (element) {
        var _this = this;
        element.on('force-update', function (event) { return _this.performLinkUpdate(element); });
        element.on('remove', function (event) { return _this.removeElements([element]); });
    };
    GraphModel.prototype.unsubscribeFromElement = function (element) {
        // if (isNode(element)) {
        //     element.on('');
        // } else if (isLink(element)) {
        // }
    };
    GraphModel.prototype.performNodeUpdate = function (node) {
        var _this = this;
        this.trigger('change:element', node);
        node.incomingLinks.forEach(function (link) {
            _this.trigger('change:element', link);
        });
        node.outgoingLinks.forEach(function (link) {
            _this.trigger('change:element', link);
        });
    };
    GraphModel.prototype.performLinkUpdate = function (link) {
        this.trigger('change:element', link);
    };
    GraphModel.prototype.removeNodesByIds = function (nodeIds) {
        var nodes = [];
        for (var _i = 0, nodeIds_1 = nodeIds; _i < nodeIds_1.length; _i++) {
            var id = nodeIds_1[_i];
            var node = this.nodes.get(id);
            if (node) {
                nodes.push(node);
            }
        }
        this.removeElements(nodes);
    };
    GraphModel.prototype.removeLinksByIds = function (linkIds) {
        var links = [];
        for (var _i = 0, linkIds_1 = linkIds; _i < linkIds_1.length; _i++) {
            var id = linkIds_1[_i];
            var link = this.links.get(id);
            if (link) {
                links.push(link);
            }
        }
        this.removeElements(links);
    };
    GraphModel.prototype.removeElements = function (elements) {
        var elementsMap = {};
        for (var _i = 0, elements_3 = elements; _i < elements_3.length; _i++) {
            var element = elements_3[_i];
            this.unsubscribeFromElement(element);
            if (isNode(element)) {
                this.nodes.delete(element.id);
            }
            else if (isLink(element)) {
                this.links.delete(element.id);
            }
        }
        this.trigger('remove:elements', elements);
    };
    return GraphModel;
}(subscribeable_1.Subscribable));
exports.GraphModel = GraphModel;
