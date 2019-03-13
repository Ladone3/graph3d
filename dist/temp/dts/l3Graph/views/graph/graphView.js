"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodeView_1 = require("./nodeView");
var linkView_1 = require("./linkView");
var customization_1 = require("../../customization");
var utils_1 = require("../../utils");
var linkRouter_1 = require("../../utils/linkRouter");
var GraphView = /** @class */ (function (_super) {
    tslib_1.__extends(GraphView, _super);
    function GraphView(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.nodeViews = new Map();
        _this.linkViews = new Map();
        _this.graphModel = props.graphModel;
        _this.linkRouter = new linkRouter_1.DefaultLinkRouter();
        _this.graphModel.nodes.forEach(function (node) { return _this.registerNode(node); });
        _this.graphModel.links.forEach(function (link) { return _this.registerLink(link); });
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
    GraphView.prototype.registerNode = function (node) {
        var isNodeViewExists = this.nodeViews.get(node.id);
        if (isNodeViewExists) {
            return; // We've already registered the view for this element
        }
        var templateProvider = this.props.nodeTemplateProvider || customization_1.DEFAULT_NODE_TEMPLATE_PROVIDER;
        var nodeTemplate = templateProvider(node);
        var view = new nodeView_1.NodeView(node, nodeTemplate);
        this.registerView(view);
        this.nodeViews.set(node.id, view);
        return view;
    };
    GraphView.prototype.registerLink = function (link) {
        var elementViewExists = this.linkViews.get(link.id);
        if (elementViewExists) {
            return; // We've registered the view for this element
        }
        var templateProvider = this.props.linkTemplateProvider || customization_1.DEFAULT_LINK_TEMPLATE_PROVIDER;
        var linkTemplate = templateProvider(link);
        var view = new linkView_1.LinkView(link, this.linkRouter, linkTemplate);
        this.registerView(view);
        this.linkViews.set(link.id, view);
        return view;
    };
    GraphView.prototype.removeNodeView = function (node) {
        var view = this.nodeViews.get(node.id);
        if (view) {
            this.unsubscribeFromView(view);
            this.nodeViews.delete(node.id);
        }
    };
    GraphView.prototype.removeLinkView = function (link) {
        var view = this.linkViews.get(link.id);
        if (view) {
            this.unsubscribeFromView(view);
            this.linkViews.delete(link.id);
        }
    };
    GraphView.prototype.registerView = function (view) {
        var _this = this;
        if (view.mesh) {
            this.onAdd3dObject(view.mesh);
        }
        if (view.overlayAnchor) {
            view.overlayAnchor.html.addEventListener('mousedown', function (e) {
                _this.trigger('overlay:down', { event: e, target: view.model });
            }, false);
            view.overlayAnchor.html.addEventListener('touchstart', function (e) {
                _this.trigger('overlay:down', { event: e, target: view.model });
            }, false);
            this.onAdd3dObject(view.overlayAnchor.sprite);
        }
        if (view.overlayAnchor3d) {
            this.anchors3d.add(view.overlayAnchor3d);
            if (this.vrManager.isStarted) {
                this.onAdd3dObject(view.overlayAnchor3d.mesh);
            }
        }
        return view;
    };
    GraphView.prototype.unsubscribeFromView = function (view) {
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
    };
    GraphView.prototype.onAdd3dObject = function (object) {
        this.props.onAdd3dObject(object);
    };
    GraphView.prototype.onRemove3dObject = function (object) {
        this.props.onRemove3dObject(object);
    };
    GraphView.prototype.update = function (_a) {
        var _this = this;
        var updatedNodeIds = _a.updatedNodeIds, updatedLinkIds = _a.updatedLinkIds;
        if (updatedNodeIds) {
            for (var _i = 0, updatedNodeIds_1 = updatedNodeIds; _i < updatedNodeIds_1.length; _i++) {
                var id = updatedNodeIds_1[_i];
                this.updateNodeView(id);
            }
        }
        else {
            this.nodeViews.forEach(function (view) {
                _this.updateNodeView(view.model.id);
            });
        }
        if (updatedLinkIds) {
            for (var _b = 0, updatedLinkIds_1 = updatedLinkIds; _b < updatedLinkIds_1.length; _b++) {
                var id = updatedLinkIds_1[_b];
                this.updateLinkView(id);
            }
        }
        else {
            this.linkViews.forEach(function (view) {
                _this.updateLinkView(view.model.id);
            });
        }
    };
    GraphView.prototype.updateLinkView = function (linkId) {
        var link = this.graphModel.getLinkById(linkId);
        if (link.modelIsChanged) {
            var oldView = this.linkViews.get(link.id);
            this.removeLinkView(link);
            var newView_1 = this.registerLink(link);
            // Restore overlays
            oldView.overlayAnchor.overlays.forEach(function (overlaysById, position) {
                overlaysById.forEach(function (overlay) {
                    newView_1.overlayAnchor.setOverlay(overlay, position);
                });
            });
            link.modelIsChanged = false;
        }
        var view = this.linkViews.get(linkId);
        if (view) { // Can be case when model is not changed but also is not loaded
            view.update();
        }
    };
    GraphView.prototype.updateNodeView = function (nodeId) {
        var node = this.graphModel.getNodeById(nodeId);
        if (node.modelIsChanged) {
            var oldView = this.nodeViews.get(node.id);
            this.removeNodeView(node);
            var newView_2 = this.registerNode(node);
            // Restore overlays
            oldView.overlayAnchor.overlays.forEach(function (overlaysById, position) {
                overlaysById.forEach(function (overlay) {
                    newView_2.overlayAnchor.setOverlay(overlay, position);
                });
            });
            node.modelIsChanged = false;
        }
        var view = this.nodeViews.get(nodeId);
        if (view) { // Can be case when model is not changed but also is not loaded
            view.update();
        }
    };
    return GraphView;
}(utils_1.Subscribable));
exports.GraphView = GraphView;
