"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var defaultViewControllers_1 = require("./controllers/defaultViewControllers");
var keyHandler_1 = require("./utils/keyHandler");
var defaultEditor_1 = require("./editors/defaultEditor");
var diagramModel_1 = require("./models/diagramModel");
var diagramView_1 = require("./views/diagramView");
var layouts_1 = require("./layout/layouts");
var mouseHandler_1 = require("./utils/mouseHandler");
var defaultWidgetsSet_1 = require("./defaultWidgetsSet");
var gamepadHandler_1 = require("./vrUtils/gamepadHandler");
var L3Graph = /** @class */ (function (_super) {
    tslib_1.__extends(L3Graph, _super);
    function L3Graph(props) {
        var _this = _super.call(this, props) || this;
        _this.viewControllers = [];
        _this.onViewMount = function (view) {
            _this.view = view;
            _this.view.graphView.on('overlay:down', function (_a) {
                var _b = _a.data, event = _b.event, target = _b.target;
                return _this.mouseHandler.onMouseDown(event, target);
            });
            _this.mouseHandler = new mouseHandler_1.MouseHandler(_this.diagramModel, _this.view);
            _this.keyHandler = new keyHandler_1.KeyHandler();
            _this.keyHandler.switchOn();
            _this.gamepadHandler = new gamepadHandler_1.GamepadHandler(_this.diagramModel, _this.view);
            _this.configureViewControllers();
            _this.defaultEditor = new defaultEditor_1.DefaultEditor(_this.diagramModel, _this.view, _this.mouseHandler, _this.keyHandler, _this.gamepadHandler);
            for (var _i = 0, DEFAULT_MESH_WIDGET_SET_1 = defaultWidgetsSet_1.DEFAULT_MESH_WIDGET_SET; _i < DEFAULT_MESH_WIDGET_SET_1.length; _i++) {
                var widgetFactory = DEFAULT_MESH_WIDGET_SET_1[_i];
                _this.registerWidget(widgetFactory);
            }
            _this.forceUpdate();
        };
        _this.onFocus = function () {
            _this.keyHandler.switchOn();
        };
        _this.onBlur = function () {
            _this.keyHandler.switchOff();
        };
        _this.diagramModel = new diagramModel_1.DiagramModel();
        _this.state = {};
        return _this;
    }
    Object.defineProperty(L3Graph.prototype, "model", {
        get: function () {
            return this.diagramModel;
        },
        enumerable: true,
        configurable: true
    });
    L3Graph.prototype.resize = function () {
        if (this.view) {
            this.view.resize();
        }
    };
    L3Graph.prototype.setViewController = function (viewController) {
        var oldViewController = this.viewController;
        this.viewController = viewController;
        if (oldViewController) {
            oldViewController.switchOff();
        }
        this.viewController.switchOn();
        this.forceUpdate();
    };
    L3Graph.prototype.attachOverlayToNode = function (node, overlay, position) {
        var nodeView = this.view.graphView.views.get(node.id);
        if (nodeView) {
            nodeView.overlayAnchor.setOverlay(overlay, position);
        }
    };
    L3Graph.prototype.removeOverlayFromNode = function (node, overlayId) {
        var nodeView = this.view.graphView.views.get(node.id);
        if (nodeView) {
            nodeView.overlayAnchor.removeOverlay(overlayId);
        }
    };
    L3Graph.prototype.componentDidMount = function () {
        if (this.props.onComponentMount) {
            this.props.onComponentMount(this);
        }
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
    L3Graph.prototype.pos3dToClientPos = function (position) {
        return this.view.pos3dToClientPos(position);
    };
    L3Graph.prototype.configureViewControllers = function () {
        var _this = this;
        this.viewControllers =
            (this.props.viewControllers || defaultViewControllers_1.DEFAULT_VIEW_CONTROLLERS_SET)
                .map(function (makeController) { return makeController(_this.view, _this.mouseHandler, _this.keyHandler, _this.gamepadHandler); });
        this.setViewController(this.viewControllers[0]);
        var _loop_1 = function (vc) {
            vc.on('switched:off', function () {
                var currentViewControllerWasSwitchedOff = _this.viewController === vc;
                if (currentViewControllerWasSwitchedOff) {
                    _this.setViewController(_this.viewControllers[0]);
                }
            });
        };
        for (var _i = 0, _a = this.viewControllers; _i < _a.length; _i++) {
            var vc = _a[_i];
            _loop_1(vc);
        }
    };
    L3Graph.prototype.registerWidget = function (widgetResolver) {
        var widgetModel = widgetResolver.getModel({
            diagramModel: this.diagramModel,
            keyHandler: this.keyHandler,
            mouseHandler: this.mouseHandler,
            gamepadHandler: this.gamepadHandler,
        });
        this.view.widgetsView.registerViewResolver(widgetModel.widgetId, widgetResolver.getView);
        this.diagramModel.widgetRegistry.registerWidget(widgetModel);
    };
    L3Graph.prototype.removeWidget = function (widgetId) {
        var widget = this.model.widgetRegistry.widgets.get(widgetId);
        if (widget) {
            this.model.widgetRegistry.removeWidget(widget);
        }
    };
    L3Graph.prototype.render = function () {
        var _this = this;
        var viewOptions = this.props.viewOptions || {};
        return React.createElement("div", { tabIndex: 0, className: 'l3graph-main', onFocus: this.onFocus, onBlur: this.onBlur },
            React.createElement("div", { className: 'l3graph-main__touch-panel', onMouseDown: function (event) {
                    if (event.currentTarget !== event.target) {
                        return;
                    }
                    _this.mouseHandler.onMouseDown(event.nativeEvent);
                }, onTouchStart: function (event) {
                    if (event.currentTarget !== event.target) {
                        return;
                    }
                    _this.mouseHandler.onMouseDown(event.nativeEvent);
                }, onWheel: function (event) { return _this.mouseHandler.onScroll(event.nativeEvent); } },
                React.createElement(diagramView_1.DiagramView, { model: this.diagramModel, onViewMount: this.onViewMount, viewOptions: viewOptions })),
            React.createElement("div", { className: 'l3graph-toolbar' },
                React.createElement("button", { title: 'Help', onClick: function () { alert(HELP_TEXT); } },
                    React.createElement("h2", { style: { margin: 0 } }, "?")),
                this.viewControllers.map(function (viewController, index) {
                    return React.createElement("button", { title: viewController.label, key: "controller-button-" + index, className: _this.viewController === viewController ? 'l3graph-selected' : '', onClick: function () { _this.setViewController(viewController); } }, viewController.label[0]);
                }),
                React.createElement("button", { id: 'l3graph-force-layout-button', title: 'Force layaout', onClick: function () { layouts_1.applyForceLayout3d(_this.diagramModel.graph, 30, 200); } }, "FL"),
                React.createElement("button", { id: 'l3graph-random-layout-button', title: 'Random layaout', onClick: function () { layouts_1.applyRandomLayout(_this.diagramModel.graph); } }, "RL")));
    };
    return L3Graph;
}(React.Component));
exports.L3Graph = L3Graph;
var HELP_TEXT = "Next three buttons provide three ways of navigation in 3D space!\nHold mouse over the button to see full name of view controller. Use mouse and keyboard arrows for navigation\nS (Spherical view controller) - Camera is moving around the center of the diagram.\nC (Cylindrical view controller) - Camera is moving around the pivot which is placed in the center of the diagram.\nO (Open space view controller) - You can move in any direction. Change the view direction my mouse dragging,\nand change the position by using keyboard arrows.";
