"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var node_1 = require("./node");
var link_1 = require("./link");
var subscribable_1 = require("../../utils/subscribable");
var GraphModel = /** @class */ (function (_super) {
    tslib_1.__extends(GraphModel, _super);
    function GraphModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._nodes = new Map();
        _this._links = new Map();
        return _this;
    }
    Object.defineProperty(GraphModel.prototype, "nodes", {
        get: function () {
            return this._nodes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphModel.prototype, "links", {
        get: function () {
            return this._links;
        },
        enumerable: true,
        configurable: true
    });
    GraphModel.prototype.getNodeById = function (id) {
        return this.nodes.get(id);
    };
    GraphModel.prototype.getLinkById = function (id) {
        return this.links.get(id);
    };
    GraphModel.prototype.addNodes = function (nodes) {
        var newNodes = [];
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var model = nodes_1[_i];
            if (!this._nodes.has(model.id)) {
                var parameters = model;
                var node = new node_1.Node(model, parameters);
                this._nodes.set(model.id, node);
                this.subscribeOnNode(node);
                newNodes.push(node);
            }
        }
        if (newNodes.length > 0) {
            this.trigger('add:elements', newNodes);
        }
    };
    GraphModel.prototype.addLinks = function (models) {
        var newLinks = [];
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (!this._links.has(model.id)) {
                var endpointsAreNotExists = !(this._nodes.has(model.sourceId) &&
                    this._nodes.has(model.targetId));
                if (endpointsAreNotExists) {
                    throw new Error("Endpoint " + (this._nodes.has(model.sourceId) ?
                        model.targetId : model.sourceId) + " is not exists!");
                }
                var linkParams = {
                    source: this._nodes.get(model.sourceId),
                    target: this._nodes.get(model.targetId),
                };
                if (linkParams.source && linkParams.target) {
                    var link = new link_1.Link(model, linkParams);
                    this._links.set(link.id, link);
                    link.source.outgoingLinks.add(link);
                    link.target.incomingLinks.add(link);
                    this.subscribeOnLink(link);
                    newLinks.push(link);
                }
            }
        }
        if (newLinks.length > 0) {
            this.trigger('add:elements', newLinks);
        }
    };
    GraphModel.prototype.updateNodes = function (definitions) {
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var definition = definitions_1[_i];
            var node = this._nodes.get(definition.id);
            node.setData(definition.data);
            node.setPosition(definition.position);
            if (definition.size) {
                node.setSize(definition.size);
            }
        }
    };
    GraphModel.prototype.updateLinks = function (models) {
        for (var _i = 0, models_2 = models; _i < models_2.length; _i++) {
            var model = models_2[_i];
            var link = this._links.get(model.id);
            link.setData(model.data);
        }
    };
    GraphModel.prototype.subscribeOnNode = function (element) {
        var _this = this;
        element.on('force-update', function () { return _this.performNodeUpdate(element); });
        element.on('change:position', function () { return _this.performNodeUpdate(element); });
        element.on('change:size', function () { return _this.performNodeUpdate(element); });
    };
    GraphModel.prototype.subscribeOnLink = function (element) {
        var _this = this;
        element.on('force-update', function () { return _this.performLinkUpdate(element); });
    };
    GraphModel.prototype.unsubscribeFromElement = function (element) {
        // if (isNode(element)) {
        //     element.on('');
        // } else if (isLink(element)) {
        // }
    };
    GraphModel.prototype.performNodeUpdate = function (node) {
        var _this = this;
        this.trigger('update:element', node);
        node.incomingLinks.forEach(function (link) {
            _this.trigger('update:element', link);
        });
        node.outgoingLinks.forEach(function (link) {
            _this.trigger('update:element', link);
        });
    };
    GraphModel.prototype.performLinkUpdate = function (link) {
        this.trigger('update:element', link);
    };
    GraphModel.prototype.removeNodes = function (nodes) {
        var nodesToDelete = [];
        var linksToDelete = [];
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var id = nodes_2[_i].id;
            if (this._nodes.has(id)) {
                var n = this._nodes.get(id);
                this.unsubscribeFromElement(n);
                nodesToDelete.push(n);
                n.incomingLinks.forEach(function (l) {
                    linksToDelete.push(l);
                });
                n.outgoingLinks.forEach(function (l) {
                    linksToDelete.push(l);
                });
            }
        }
        this.removeLinks(linksToDelete);
        for (var _a = 0, nodesToDelete_1 = nodesToDelete; _a < nodesToDelete_1.length; _a++) {
            var node = nodesToDelete_1[_a];
            this._nodes.delete(node.id);
        }
        this.trigger('remove:elements', nodesToDelete);
    };
    GraphModel.prototype.removeLinks = function (links) {
        var deletedLinks = [];
        for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
            var link = links_1[_i];
            var id = link.id;
            if (this._links.has(id)) {
                var l = this._links.get(id);
                this.unsubscribeFromElement(l);
                deletedLinks.push(l);
                this._links.delete(id);
                l.source.incomingLinks.delete(l);
                l.source.outgoingLinks.delete(l);
                l.target.incomingLinks.delete(l);
                l.target.outgoingLinks.delete(l);
            }
        }
        this.trigger('remove:elements', deletedLinks);
    };
    return GraphModel;
}(subscribable_1.Subscribable));
exports.GraphModel = GraphModel;
