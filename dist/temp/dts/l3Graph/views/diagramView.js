Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var graphView_1 = require("./graph/graphView");
var widgetsView_1 = require("./widgets/widgetsView");
var highlighter_1 = require("../utils/highlighter");
exports.DEFAULT_CAMERA_DIST = 100;
exports.DEFAULT_SCREEN_PARAMETERS = {
    VIEW_ANGLE: 45,
    NEAR: 0.1,
    FAR: 10000,
};
var DiagramView = (function (_super) {
    tslib_1.__extends(DiagramView, _super);
    function DiagramView(props) {
        var _this = _super.call(this, props) || this;
        _this.core = props.core;
        _this.highlighter = new highlighter_1.ElementHighlighter(_this);
        return _this;
    }
    DiagramView.prototype.componentDidMount = function () {
        var _this = this;
        this.core.vrManager.on('connection:state:changed', function () {
            _this.widgetsView.update();
        });
        this.initSubViews();
        this.subscribeOnModel();
        this.subscribeOnHandlers();
        this.core.attachTo(this.meshHtmlContainer, this.overlayHtmlContainer);
        if (this.props.onViewMount) {
            this.props.onViewMount(this);
        }
    };
    DiagramView.prototype.componentDidUpdate = function () {
        this.subscribeOnHandlers();
    };
    DiagramView.prototype.initSubViews = function () {
        var viewOptions = this.props.viewOptions || {};
        this.graphView = new graphView_1.GraphView({
            vrManager: this.core.vrManager,
            graphModel: this.props.model.graph,
            nodeTemplateProvider: viewOptions.nodeTemplateProvider,
            linkTemplateProvider: viewOptions.linkTemplateProvider,
            core: this.props.core,
        });
        this.widgetsView = new widgetsView_1.WidgetsView({
            diagramView: this,
            vrManager: this.core.vrManager,
            widgetsModel: this.props.model.widgetRegistry,
            core: this.props.core,
        });
    };
    DiagramView.prototype.subscribeOnModel = function () {
        var _this = this;
        var model = this.props.model;
        model.on('syncupdate', function (combinedEvent) {
            var _a = combinedEvent.data, nodeEvents = _a.nodeEvents, linkEvents = _a.linkEvents, widgetEvents = _a.widgetEvents;
            var updatedNodeIds = [];
            nodeEvents.forEach(function (event) {
                switch (event.type) {
                    case 'add:node':
                        _this.graphView.registerNode(event.target);
                        break;
                    case 'remove:node':
                        _this.graphView.removeNodeView(event.target);
                        break;
                    case 'update:node':
                        updatedNodeIds.push(event.target.id);
                        break;
                }
            });
            var updatedLinkIds = [];
            linkEvents.forEach(function (event) {
                switch (event.type) {
                    case 'add:link':
                        _this.graphView.registerLink(event.target);
                        break;
                    case 'remove:link':
                        _this.graphView.removeLinkView(event.target);
                        break;
                    case 'update:link':
                        updatedLinkIds.push(event.target.id);
                        break;
                }
            });
            var updatedWidgetIds = [];
            widgetEvents.forEach(function (event) {
                switch (event.type) {
                    case 'add:widget':
                        _this.widgetsView.registerWidgetViewForModel(event.target);
                        break;
                    case 'remove:widget':
                        _this.widgetsView.removeWidgetViewOfModel(event.target);
                        break;
                    case 'update:widget':
                        var widget = event.target;
                        updatedWidgetIds.push(widget.widgetId);
                        break;
                }
            });
            _this.graphView.update({ updatedNodeIds: updatedNodeIds, updatedLinkIds: updatedLinkIds });
            _this.widgetsView.update(updatedWidgetIds);
            _this.core.forceRender();
        });
    };
    DiagramView.prototype.subscribeOnHandlers = function () {
        var _this = this;
        var _a = this.props, dragHandlers = _a.dragHandlers, core = _a.core;
        if (!dragHandlers || this.dragHandlers) {
            return;
        }
        this.dragHandlers = dragHandlers;
        for (var _i = 0, _b = this.dragHandlers; _i < _b.length; _i++) {
            var dragHandler = _b[_i];
            dragHandler.on('elementHoverStart', function (e) {
                _this.highlighter.highlight(e.data.target);
                _this.core.forceRender();
            });
            dragHandler.on('elementHoverEnd', function (e) {
                _this.highlighter.clear(e.data.target);
                _this.core.forceRender();
            });
        }
    };
    DiagramView.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { className: 'l3graph-main_screen' },
            React.createElement("div", { className: 'l3graph-main_screen__mesh-layer', ref: function (div) { return _this.meshHtmlContainer = div; } }),
            React.createElement("div", { className: 'l3graph-main_screen__overlay-layer', ref: function (div) { return _this.overlayHtmlContainer = div; } }));
    };
    return DiagramView;
}(React.Component));
exports.DiagramView = DiagramView;
