"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphModel_1 = require("../models/graphModel");
var nodeView_1 = require("./nodeView");
var linkView_1 = require("./linkView");
var templates_1 = require("../templates");
var simpleLinkView_1 = require("./simpleLinkView");
var GraphView = /** @class */ (function () {
    function GraphView(props) {
        var _this = this;
        this.props = props;
        this.views = new Map();
        this.scene = props.scene;
        this.graphModel = props.graphModel;
        this.graphModel.nodes.forEach(function (node) { return _this.addElementView(node); });
        this.graphModel.links.forEach(function (link) { return _this.addElementView(link); });
    }
    GraphView.prototype.addElementView = function (element) {
        var view = this.findViewForElement(element);
        if (view) {
            var mesh = view.mesh;
            if (mesh) {
                this.scene.add(mesh);
            }
            var overlay = view.overlay;
            if (overlay) {
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
    };
    GraphView.prototype.findViewForElement = function (model) {
        if (graphModel_1.isNode(model)) {
            var templateProvider = this.props.nodeTemplateProvider || templates_1.DEFAULT_NODE_TEMPLATE_PROVIDER;
            return new nodeView_1.NodeView(model, templateProvider(model.types));
        }
        else if (graphModel_1.isLink(model)) {
            var templateProvider = this.props.linkTemplateProvider || templates_1.DEFAULT_LINK_TEMPLATE_PROVIDER;
            if (this.props.simpleLinks) {
                return new simpleLinkView_1.SimpleLinkView(model, templateProvider(model.types));
            }
            else {
                return new linkView_1.LinkView(model, templateProvider(model.types));
            }
        }
        else {
            return undefined;
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
            view.update();
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
}());
exports.GraphView = GraphView;
