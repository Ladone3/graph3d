"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var graphModel_1 = require("../models/graphModel");
var nodeView_1 = require("./nodeView");
var linkView_1 = require("./linkView");
var templates_1 = require("../templates");
var simpleLinkView_1 = require("./simpleLinkView");
var utils_1 = require("../utils");
var GraphView = /** @class */ (function (_super) {
    tslib_1.__extends(GraphView, _super);
    function GraphView(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.views = new Map();
        _this.scene = props.scene;
        _this.graphModel = props.graphModel;
        _this.graphModel.nodes.forEach(function (node) { return _this.addElementView(node); });
        _this.graphModel.links.forEach(function (link) { return _this.addElementView(link); });
        return _this;
    }
    GraphView.prototype.addElementView = function (element) {
        var _this = this;
        var elementViewExists = this.views.get(element.id);
        if (elementViewExists) {
            return; // We already have view for this element
        }
        var view;
        if (graphModel_1.isNode(element)) {
            view = this.createNodeView(element);
        }
        else {
            var group = this.graphModel.getGroup(element);
            view = this.createLinkView(element, group);
        }
        if (view) {
            var mesh = view.mesh;
            if (mesh) {
                this.scene.add(mesh);
            }
            var overlay = view.overlay;
            if (overlay) {
                var htmlElement = overlay.element.firstChild;
                htmlElement.addEventListener('mousedown', function (event) {
                    _this.trigger('click:overlay', { event: event, target: element });
                });
                this.scene.add(overlay);
            }
            this.views.set(element.id, view);
        }
    };
    GraphView.prototype.removeElementView = function (element) {
        var view = this.views.get(element.id);
        if (view) {
            if (view.mesh) {
                this.scene.remove(view.mesh);
            }
            if (view.overlay) {
                this.scene.remove(view.overlay);
            }
        }
        this.views.delete(element.id);
    };
    GraphView.prototype.createNodeView = function (node) {
        var templateProvider = this.props.nodeTemplateProvider || templates_1.DEFAULT_NODE_TEMPLATE_PROVIDER;
        return new nodeView_1.NodeView(node, templateProvider(node.types));
    };
    GraphView.prototype.createLinkView = function (link, group) {
        var templateProvider = this.props.linkTemplateProvider || templates_1.DEFAULT_LINK_TEMPLATE_PROVIDER;
        if (this.props.simpleLinks) {
            return new simpleLinkView_1.SimpleLinkView(link, templateProvider(link.types));
        }
        else {
            return new linkView_1.LinkView(link, group, templateProvider(link.types));
        }
    };
    GraphView.prototype.update = function (specificIds) {
        var _this = this;
        // const selection = this
        var updateView = function (elementId) {
            if (_this.graphModel.fullUpdateList.has(elementId)) {
                var element = _this.graphModel.getElementById(elementId);
                _this.removeElementView(element);
                _this.addElementView(element);
            }
            var view = _this.views.get(elementId);
            if (view) {
                view.update();
            }
        };
        if (!specificIds) {
            specificIds = [];
            this.views.forEach(function (view) {
                specificIds.push(view.model.id);
            });
        }
        for (var _i = 0, specificIds_1 = specificIds; _i < specificIds_1.length; _i++) {
            var id = specificIds_1[_i];
            updateView(id);
        }
        this.graphModel.fullUpdateList.clear();
    };
    return GraphView;
}(utils_1.Subscribable));
exports.GraphView = GraphView;
