"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var defaultViewControllers_1 = require("./controllers/defaultViewControllers");
var keyHandler_1 = require("./utils/keyHandler");
var mouseEditor_1 = require("./editors/mouseEditor");
var diagramModel_1 = require("./models/diagramModel");
var diagramView_1 = require("./views/diagramView");
var utils_1 = require("./utils");
var layouts_1 = require("./layout/layouts");
var L3Graph = /** @class */ (function (_super) {
    tslib_1.__extends(L3Graph, _super);
    function L3Graph(props) {
        var _this = _super.call(this, props) || this;
        _this.viewControllers = [];
        _this.onViewMount = function (view) {
            _this.view = view;
            var controllersSet = _this.props.viewControllers || defaultViewControllers_1.DEFAULT_VIEW_CONTROLLERS_SET;
            _this.viewControllers = controllersSet.map(function (controller) { return controller(view); });
            _this.viewController = _this.viewControllers[0];
            _this.mouseEditor = new mouseEditor_1.MouseEditor(_this.model, view);
            _this.forceUpdate();
        };
        _this.onFocus = function () {
            _this.keyHandler.switchOn();
        };
        _this.onBlur = function () {
            _this.keyHandler.switchOff();
        };
        _this.onKeyPressed = function (keyMap) {
            if (_this.viewController) {
                _this.viewController.onKeyPressed(keyMap);
            }
        };
        _this.model = new diagramModel_1.DiagramModel();
        _this.state = {};
        _this.keyHandler = new keyHandler_1.KeyHandler();
        _this.updateGraph({
            newNodes: props.graph.nodes,
            newLinks: props.graph.links,
        });
        return _this;
    }
    L3Graph.prototype.componentWillUpdate = function (props) {
        var graph = props.graph;
        this.updateGraph(this.merge(graph));
    };
    Object.defineProperty(L3Graph.prototype, "viewController", {
        get: function () {
            return this.state.viewController;
        },
        set: function (viewController) {
            viewController.refreshCamera();
            this.setState({ viewController: viewController });
        },
        enumerable: true,
        configurable: true
    });
    L3Graph.prototype.componentDidMount = function () {
        var _this = this;
        if (this.props.onComponentMount) {
            this.props.onComponentMount(this);
        }
        this.keyHandler.on('keyPressed', function (event) { return _this.onKeyPressed(event.data); });
    };
    L3Graph.prototype.componentWillUnmount = function () {
        if (this.props.onComponentUnmount) {
            this.props.onComponentUnmount(this);
        }
        this.onBlur();
    };
    L3Graph.prototype.clientPosTo3dPos = function (position, distanceFromScreen) {
        if (distanceFromScreen === void 0) { distanceFromScreen = 600; }
        return this.view.clientPosTo3dPos(position, distanceFromScreen);
    };
    L3Graph.prototype.updateGraph = function (update) {
        var newNodes = update.newNodes, newLinks = update.newLinks, nodesToRemove = update.nodesToRemove, linksToRemove = update.linksToRemove, linksToUpdate = update.linksToUpdate, nodesToUpdate = update.nodesToUpdate;
        if (newNodes) {
            this.model.addElements(newNodes);
        }
        if (newLinks) {
            this.model.addElements(newLinks);
        }
        if (linksToRemove && linksToRemove.length > 0) {
            this.model.removeLinksByIds(linksToRemove.map(function (l) { return l.id; }));
        }
        if (nodesToRemove && nodesToRemove.length > 0) {
            this.model.removeNodesByIds(nodesToRemove.map(function (n) { return n.id; }));
        }
        if (nodesToUpdate && nodesToUpdate.length > 0) {
            this.model.updateElements(nodesToUpdate);
        }
        if (linksToUpdate && linksToUpdate.length > 0) {
            this.model.updateElements(linksToUpdate);
        }
    };
    L3Graph.prototype.merge = function (newGraphModel) {
        var graph = this.model.graph;
        var nodes = newGraphModel.nodes, links = newGraphModel.links;
        var newNodes = [];
        var newLinks = [];
        var nodesToRemove = [];
        var linksToRemove = [];
        var nodesToUpdate = [];
        var linksToUpdate = [];
        var nodeMap = new Map();
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            var id = node.id;
            if (!graph.nodes.has(id)) {
                newNodes.push(node);
            }
            else {
                var curNode = graph.nodes.get(id);
                var needUpdateView = curNode.data !== node.data ||
                    !utils_1.isTypesEqual(curNode.types, node.types);
                if (needUpdateView) {
                    nodesToUpdate.push(node);
                }
            }
            nodeMap.set(id, node);
        }
        if (graph.nodes) {
            graph.nodes.forEach(function (node) {
                if (!nodeMap.has(node.id)) {
                    nodesToRemove.push(node);
                }
            });
        }
        var linksMap = new Map();
        for (var _a = 0, links_1 = links; _a < links_1.length; _a++) {
            var link = links_1[_a];
            var id = link.id;
            if (!graph.links.has(id)) {
                newLinks.push(link);
            }
            else {
                var curLink = graph.links.get(id);
                var needUpdateView = curLink.label !== link.label ||
                    curLink.types.sort().join('') !== link.types.sort().join('');
                if (needUpdateView) {
                    linksToUpdate.push(link);
                }
            }
            linksMap.set(id, link);
        }
        if (graph.links) {
            graph.links.forEach(function (link) {
                if (!linksMap.has(link.id)) {
                    linksToRemove.push(link);
                }
            });
        }
        return { newNodes: newNodes, newLinks: newLinks, nodesToRemove: nodesToRemove, linksToRemove: linksToRemove, nodesToUpdate: nodesToUpdate, linksToUpdate: linksToUpdate };
    };
    L3Graph.prototype.onWheel = function (e) {
        this.viewController.onMouseWheel(e.nativeEvent);
    };
    L3Graph.prototype.onMouseDown = function (event) {
        if (this.mouseEditor.onMouseDown(event.nativeEvent)) {
            this.viewController.onMouseDown(event.nativeEvent);
            this.model.selection = new Set();
        }
    };
    L3Graph.prototype.render = function () {
        var _this = this;
        var viewOptions = this.props.viewOptions || {};
        return React.createElement("div", { tabIndex: 0, className: 'o3d-main', onFocus: this.onFocus, onBlur: this.onBlur },
            React.createElement("div", { className: 'o3d-main__touch-panel', onMouseDown: function (event) { return _this.onMouseDown(event); }, onWheel: function (event) { return _this.onWheel(event); } },
                React.createElement(diagramView_1.DiagramView, { model: this.model, onViewMount: this.onViewMount, viewOptions: viewOptions })),
            React.createElement("div", { className: 'o3d-toolbar' },
                this.viewControllers.map(function (viewController, index) {
                    return React.createElement("button", { title: viewController.label, key: "controller-button-" + index, className: _this.viewController === viewController ? 'o3d-selected' : '', onClick: function () { _this.viewController = viewController; } }, viewController.label[0]);
                }),
                React.createElement("button", { id: 'o3d-force-layout-button', title: 'Force layaout', onClick: function () { layouts_1.applyForceLayout3d(_this.model.graph, 30, 150); } }, "FL"),
                React.createElement("button", { id: 'o3d-random-layout-button', title: 'Random layaout', onClick: function () { layouts_1.applyRandomLayout(_this.model.graph); } }, "RL")));
    };
    return L3Graph;
}(React.Component));
exports.L3Graph = L3Graph;
