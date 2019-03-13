Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var keyHandler_1 = require("./input/keyHandler");
var defaultEditor_1 = require("./editors/defaultEditor");
var diagramModel_1 = require("./models/diagramModel");
var diagramView_1 = require("./views/diagramView");
var mouseHandler_1 = require("./input/mouseHandler");
var gamepadHandler_1 = require("./input/gamepadHandler");
var gamepadEditor_1 = require("./editors/gamepadEditor");
var defaultViewControllers_1 = require("./controllers/defaultViewControllers");
var defaultWidgetsSet_1 = require("./defaultWidgetsSet");
var core_1 = require("./core");
var L3Graph = (function (_super) {
    tslib_1.__extends(L3Graph, _super);
    function L3Graph(props) {
        var _this = _super.call(this, props) || this;
        _this.viewControllers = [];
        _this.onViewMount = function (view) {
            _this.view = view;
            _this.view.graphView.on('overlay:down', function (_a) {
                var _b = _a.data, event = _b.event, target = _b.target;
                return _this.mouseHandler.onMouseDownEvent(event, target);
            });
            _this.mouseHandler = new mouseHandler_1.MouseHandler(_this.diagramModel, _this.view);
            _this.keyHandler = new keyHandler_1.KeyHandler(_this.core);
            _this.keyHandler.switchOn();
            _this.gamepadHandler = new gamepadHandler_1.GamepadHandler(_this.diagramModel, _this.view);
            _this.configureViewControllers();
            _this.defaultEditor = new defaultEditor_1.DefaultEditor(_this.diagramModel, _this.mouseHandler, _this.keyHandler, _this.gamepadHandler);
            _this.gamepadEditor = new gamepadEditor_1.GamepadEditor(_this.gamepadHandler);
            for (var _i = 0, _a = defaultWidgetsSet_1.DEFAULT_MESH_WIDGET_SET(); _i < _a.length; _i++) {
                var widgetFactory = _a[_i];
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
        _this.core = new core_1.Core();
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
            this.core.resize();
        }
    };
    L3Graph.prototype.getViewControllers = function () {
        return this.viewControllers;
    };
    L3Graph.prototype.getViewController = function () {
        return this.viewController;
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
        var nodeView = this.view.graphView.nodeViews.get(node);
        if (nodeView) {
            nodeView.overlayAnchor.setOverlay(overlay, position);
        }
    };
    L3Graph.prototype.removeOverlayFromNode = function (node, overlayId) {
        var nodeView = this.view.graphView.nodeViews.get(node);
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
        return this.core.clientPosTo3dPos(position, distanceFromScreen);
    };
    L3Graph.prototype.pos3dToClientPos = function (position) {
        return this.core.pos3dToClientPos(position);
    };
    L3Graph.prototype.configureViewControllers = function () {
        var _this = this;
        this.viewControllers =
            (this.props.viewControllers || defaultViewControllers_1.DEFAULT_VIEW_CONTROLLERS_SET())
                .map(function (makeController) { return makeController(_this.core, _this.mouseHandler, _this.keyHandler, _this.gamepadHandler); });
        this.setViewController(this.viewControllers[0]);
        var _loop_1 = function (vc) {
            vc.on('switched:off', function () {
                var currentViewControllerWasSwitchedOff = _this.viewController === vc;
                if (currentViewControllerWasSwitchedOff && _this.viewControllers[0] !== vc) {
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
            vrManager: this.core.vrManager,
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
        var dragHandlers = [];
        if (this.gamepadHandler) {
            dragHandlers.push(this.gamepadHandler);
        }
        if (this.mouseHandler) {
            dragHandlers.push(this.mouseHandler);
        }
        return React.createElement("div", { tabIndex: 0, className: 'l3graph-main', onFocus: this.onFocus, onBlur: this.onBlur },
            React.createElement("div", { className: 'l3graph-main__touch-panel', onMouseMove: function (event) {
                    _this.mouseHandler.onMouseMoveEvent(event.nativeEvent);
                }, onMouseDown: function (event) {
                    if (event.currentTarget !== event.target) {
                        return;
                    }
                    _this.mouseHandler.onMouseDownEvent(event.nativeEvent);
                }, onTouchStart: function (event) {
                    if (event.currentTarget !== event.target) {
                        return;
                    }
                    _this.mouseHandler.onMouseDownEvent(event.nativeEvent);
                }, onWheel: function (event) { return _this.mouseHandler.onScrollEvent(event.nativeEvent); } },
                React.createElement(diagramView_1.DiagramView, { model: this.diagramModel, core: this.core, onViewMount: this.onViewMount, viewOptions: viewOptions, dragHandlers: dragHandlers.length > 0 ? dragHandlers : undefined })),
            this.props.children);
    };
    return L3Graph;
}(React.Component));
exports.L3Graph = L3Graph;
var HELP_TEXT = "Next three buttons provide three ways of navigation in 3D space!\nHold mouse over the button to see full name of view controller. Use mouse and keyboard arrows for navigation\nS (Spherical view controller) - Camera is moving around the center of the diagram.\nC (Cylindrical view controller) - Camera is moving around the pivot which is placed in the center of the diagram.\nO (Open space view controller) - You can move in any direction. Change the view direction my mouse dragging,\nand change the position by using keyboard arrows.";
