"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodeView_1 = require("./nodeView");
var linkView_1 = require("./linkView");
var customisation_1 = require("../../customisation");
var utils_1 = require("../../utils");
var node_1 = require("../../models/graph/node");
var linkRouter_1 = require("../../utils/linkRouter");
var GraphView = /** @class */ (function (_super) {
    tslib_1.__extends(GraphView, _super);
    function GraphView(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.views = new Map();
        _this.graphModel = props.graphModel;
        _this.linkRouter = new linkRouter_1.DefaultLinkRouter();
        _this.graphModel.nodes.forEach(function (node) { return _this.registerElement(node); });
        _this.graphModel.links.forEach(function (link) { return _this.registerElement(link); });
        _this.anchors3d = new Set();
        _this.vrManager = props.vrManager;
        _this.vrManager.on('presenting:state:changed', function () {
            if (_this.vrManager.isStarted) {
                _this.anchors3d.forEach(function (sprite) { return _this.onAdd3dObject(sprite.mesh); });
            }
            else {
                _this.anchors3d.forEach(function (sprite) { return _this.onRemove3dObject(sprite.mesh); });
            }
        });
        return _this;
    }
    GraphView.prototype.registerElement = function (element) {
        var _this = this;
        var elementViewExists = this.views.get(element.id);
        if (elementViewExists) {
            return; // We'v registered the view for this element
        }
        var view;
        if (element instanceof node_1.Node) {
            view = this.createNodeView(element);
        }
        else {
            view = this.createLinkView(element);
        }
        if (view) {
            if (view.mesh) {
                this.onAdd3dObject(view.mesh);
            }
            if (view.overlayAnchor) {
                view.overlayAnchor.html.addEventListener('mousedown', function (e) {
                    _this.trigger('overlay:down', { event: e, target: element });
                }, false);
                view.overlayAnchor.html.addEventListener('touchstart', function (e) {
                    _this.trigger('overlay:down', { event: e, target: element });
                }, false);
                this.onAdd3dObject(view.overlayAnchor.sprite);
            }
            if (view.overlayAnchor3d) {
                this.anchors3d.add(view.overlayAnchor3d);
            }
            this.views.set(element.id, view);
        }
        return view;
    };
    GraphView.prototype.removeElementView = function (element) {
        var view = this.views.get(element.id);
        if (view) {
            if (view.mesh) {
                this.onRemove3dObject(view.mesh);
            }
            if (view.overlayAnchor) {
                this.onRemove3dObject(view.overlayAnchor.sprite);
            }
            if (view.overlayAnchor3d) {
                this.onRemove3dObject(view.overlayAnchor3d.mesh);
                this.anchors3d.delete(view.overlayAnchor3d);
            }
        }
        this.views.delete(element.id);
    };
    GraphView.prototype.onAdd3dObject = function (object) {
        this.props.onAdd3dObject(object);
    };
    GraphView.prototype.onRemove3dObject = function (object) {
        this.props.onRemove3dObject(object);
    };
    GraphView.prototype.createNodeView = function (node) {
        var templateProvider = this.props.nodeTemplateProvider || customisation_1.DEFAULT_NODE_TEMPLATE_PROVIDER;
        var nodeTemplate = tslib_1.__assign(tslib_1.__assign({}, customisation_1.DEFAULT_NODE_TEMPLATE), templateProvider(node.data));
        return new nodeView_1.NodeView(node, nodeTemplate);
    };
    GraphView.prototype.createLinkView = function (link) {
        var templateProvider = this.props.linkTemplateProvider || customisation_1.DEFAULT_LINK_TEMPLATE_PROVIDER;
        var linkTemplate = tslib_1.__assign(tslib_1.__assign({}, customisation_1.DEFAULT_LINK_TEMPLATE), templateProvider(link.model));
        return new linkView_1.LinkView(link, this.linkRouter, linkTemplate);
    };
    GraphView.prototype.update = function (specificIds) {
        var _this = this;
        var updateView = function (elementId) {
            var element = _this.graphModel.getNodeById(elementId) || _this.graphModel.getLinkById(elementId);
            if (element.modelIsChanged) {
                var oldView = _this.views.get(element.id);
                _this.removeElementView(element);
                var newView_1 = _this.registerElement(element);
                // Restore overlays
                oldView.overlayAnchor.overlays.forEach(function (overlaysById, position) {
                    overlaysById.forEach(function (overlay) {
                        newView_1.overlayAnchor.setOverlay(overlay, position);
                    });
                });
                element.modelIsChanged = false;
            }
            var view = _this.views.get(elementId);
            if (view) { // View is added asynchronously
                view.update();
            }
        };
        if (specificIds) {
            for (var _i = 0, specificIds_1 = specificIds; _i < specificIds_1.length; _i++) {
                var id = specificIds_1[_i];
                updateView(id);
            }
        }
        else {
            specificIds = [];
            this.views.forEach(function (view) {
                updateView(view.model.id);
            });
        }
    };
    return GraphView;
}(utils_1.Subscribable));
exports.GraphView = GraphView;
