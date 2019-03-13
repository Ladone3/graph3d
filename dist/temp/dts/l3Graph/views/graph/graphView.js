Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodeView_1 = require("./nodeView");
var linkView_1 = require("./linkView");
var customization_1 = require("../../customization");
var utils_1 = require("../../utils");
var linkRouter_1 = require("../../utils/linkRouter");
var GraphView = (function (_super) {
    tslib_1.__extends(GraphView, _super);
    function GraphView(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.nodeViews = new Map();
        _this.linkViews = new Map();
        _this.anchors3d = new Map();
        _this.graphModel = props.graphModel;
        _this.linkRouter = new linkRouter_1.DefaultLinkRouter();
        _this.graphModel.nodes.forEach(function (node) { return _this.registerNode(node); });
        _this.graphModel.links.forEach(function (link) { return _this.registerLink(link); });
        _this.vrManager = props.vrManager;
        _this.vrManager.on('connection:state:changed', function () {
            if (_this.vrManager.isConnected) {
                for (var _i = 0, _a = Array.from(_this.anchors3d.keys()); _i < _a.length; _i++) {
                    var anchor = _a[_i];
                    var anchor3d = anchor.createAnchor3d();
                    _this.anchors3d.set(anchor, anchor3d);
                    _this.add3dObject(anchor3d.mesh);
                }
            }
            else {
                for (var _b = 0, _c = Array.from(_this.anchors3d.keys()); _b < _c.length; _b++) {
                    var anchor = _c[_b];
                    var anchor3d = _this.anchors3d.get(anchor);
                    _this.anchors3d.set(anchor, undefined);
                    _this.remove3dObject(anchor3d.mesh);
                }
            }
        });
        return _this;
    }
    GraphView.prototype.registerNode = function (node) {
        var isNodeViewExists = this.nodeViews.get(node);
        if (isNodeViewExists) {
            return;
        }
        var templateProvider = this.props.nodeTemplateProvider || customization_1.DEFAULT_NODE_TEMPLATE_PROVIDER;
        var nodeTemplate = templateProvider(node);
        var view = new nodeView_1.NodeView(node, nodeTemplate);
        this.registerView(view);
        this.nodeViews.set(node, view);
        return view;
    };
    GraphView.prototype.registerLink = function (link) {
        var elementViewExists = this.linkViews.get(link);
        if (elementViewExists) {
            return;
        }
        var templateProvider = this.props.linkTemplateProvider || customization_1.DEFAULT_LINK_TEMPLATE_PROVIDER;
        var linkTemplate = templateProvider(link);
        var view = new linkView_1.LinkView(link, this.linkRouter, linkTemplate);
        this.registerView(view);
        this.linkViews.set(link, view);
        return view;
    };
    GraphView.prototype.removeNodeView = function (node) {
        var view = this.nodeViews.get(node);
        if (view) {
            this.unsubscribeFromView(view);
            this.nodeViews.delete(node);
        }
    };
    GraphView.prototype.removeLinkView = function (link) {
        var view = this.linkViews.get(link);
        if (view) {
            this.unsubscribeFromView(view);
            this.linkViews.delete(link);
        }
    };
    GraphView.prototype.registerView = function (view) {
        var _this = this;
        if (view.mesh) {
            this.add3dObject(view.mesh);
        }
        if (view.overlayAnchor) {
            view.overlayAnchor.html.addEventListener('mousedown', function (e) {
                _this.trigger('overlay:down', { event: e, target: view.model });
            }, false);
            view.overlayAnchor.html.addEventListener('touchstart', function (e) {
                _this.trigger('overlay:down', { event: e, target: view.model });
            }, false);
            this.add3dObject(view.overlayAnchor.sprite);
            this.anchors3d.set(view.overlayAnchor, undefined);
        }
        return view;
    };
    GraphView.prototype.unsubscribeFromView = function (view) {
        if (view.mesh) {
            this.remove3dObject(view.mesh);
        }
        if (view.overlayAnchor) {
            this.remove3dObject(view.overlayAnchor.sprite);
            var overlayAnchor3d = this.anchors3d.get(view.overlayAnchor);
            if (overlayAnchor3d) {
                this.remove3dObject(overlayAnchor3d.mesh);
                this.anchors3d.delete(view.overlayAnchor);
            }
        }
    };
    GraphView.prototype.add3dObject = function (object) {
        this.props.core.scene.add(object);
    };
    GraphView.prototype.remove3dObject = function (object) {
        this.props.core.scene.remove(object);
    };
    GraphView.prototype.update = function (_a) {
        var _this = this;
        var updatedNodeIds = _a.updatedNodeIds, updatedLinkIds = _a.updatedLinkIds;
        if (updatedNodeIds) {
            for (var _i = 0, updatedNodeIds_1 = updatedNodeIds; _i < updatedNodeIds_1.length; _i++) {
                var id = updatedNodeIds_1[_i];
                var node = this.graphModel.getNodeById(id);
                if (node) {
                    this.updateNodeView(node);
                }
            }
        }
        else {
            this.nodeViews.forEach(function (view) {
                _this.updateNodeView(view.model);
            });
        }
        if (updatedLinkIds) {
            for (var _b = 0, updatedLinkIds_1 = updatedLinkIds; _b < updatedLinkIds_1.length; _b++) {
                var id = updatedLinkIds_1[_b];
                var link = this.graphModel.getLinkById(id);
                if (link) {
                    this.updateLinkView(link);
                }
            }
        }
        else {
            this.linkViews.forEach(function (view) {
                _this.updateLinkView(view.model);
            });
        }
    };
    GraphView.prototype.updateLinkView = function (link) {
        if (link.modelIsChanged) {
            var oldView = this.linkViews.get(link);
            this.removeLinkView(link);
            var newView_1 = this.registerLink(link);
            oldView.overlayAnchor.overlays.forEach(function (overlaysById, position) {
                overlaysById.forEach(function (overlay) {
                    newView_1.overlayAnchor.setOverlay(overlay, position);
                });
            });
            link.modelIsChanged = false;
        }
        var view = this.linkViews.get(link);
        if (view) {
            view.update();
            var anchor3d = this.anchors3d.get(view.overlayAnchor);
            if (anchor3d) {
                anchor3d.update();
            }
        }
    };
    GraphView.prototype.updateNodeView = function (node) {
        if (node.modelIsChanged) {
            var oldView = this.nodeViews.get(node);
            this.removeNodeView(node);
            var newView_2 = this.registerNode(node);
            oldView.overlayAnchor.overlays.forEach(function (overlaysById, position) {
                overlaysById.forEach(function (overlay) {
                    newView_2.overlayAnchor.setOverlay(overlay, position);
                });
            });
            node.modelIsChanged = false;
        }
        var view = this.nodeViews.get(node);
        if (view) {
            view.update();
            var anchor3d = this.anchors3d.get(view.overlayAnchor);
            if (anchor3d) {
                anchor3d.update();
            }
        }
    };
    return GraphView;
}(utils_1.Subscribable));
exports.GraphView = GraphView;
