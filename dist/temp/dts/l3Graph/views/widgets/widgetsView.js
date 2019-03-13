Object.defineProperty(exports, "__esModule", { value: true });
var WidgetsView = (function () {
    function WidgetsView(props) {
        var _this = this;
        this.props = props;
        this.views = new Map();
        this.diagramView = props.diagramView;
        this.vrManager = props.vrManager;
        this.viewRegistry = new Map();
        this.widgetsModel = props.widgetsModel;
        this.widgetsModel.widgets.forEach(function (widget) { return _this.registerWidgetViewForModel(widget); });
    }
    WidgetsView.prototype.registerViewResolver = function (widgetId, viewResolver) {
        this.viewRegistry.set(widgetId, viewResolver);
    };
    WidgetsView.prototype.registerWidgetViewForModel = function (widget) {
        var widgetViewExists = this.views.get(widget.widgetId);
        if (widgetViewExists) {
            return;
        }
        var view = this.findViewForWidget(widget);
        if (view) {
            if (view.mesh) {
                this.onAdd3dObject(view.mesh);
            }
            if (view.overlayAnchor) {
                this.onAdd3dObject(view.overlayAnchor.sprite);
            }
            if (view.overlayAnchor3d) {
                this.onAdd3dObject(view.overlayAnchor3d.mesh);
            }
            this.views.set(widget.widgetId, view);
        }
    };
    WidgetsView.prototype.removeWidgetViewOfModel = function (widget) {
        var view = this.views.get(widget.widgetId);
        if (view) {
            if (view.mesh) {
                this.onRemove3dObject(view.mesh);
            }
            if (view.overlayAnchor) {
                this.onRemove3dObject(view.overlayAnchor.sprite);
            }
            if (view.overlayAnchor) {
                this.onRemove3dObject(view.overlayAnchor3d.mesh);
            }
            if (view.onRemove) {
                view.onRemove();
            }
        }
        this.views.delete(widget.widgetId);
    };
    WidgetsView.prototype.onAdd3dObject = function (object) {
        this.props.onAdd3dObject(object);
    };
    WidgetsView.prototype.onRemove3dObject = function (object) {
        this.props.onRemove3dObject(object);
    };
    WidgetsView.prototype.findViewForWidget = function (widget) {
        return this.viewRegistry.get(widget.widgetId)({
            widget: widget,
            diagramView: this.diagramView,
            vrManager: this.vrManager,
        });
    };
    WidgetsView.prototype.update = function (specificIds) {
        var _this = this;
        var updateView = function (widgetId) {
            var view = _this.views.get(widgetId);
            if (view) {
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
                updateView(view.model.widgetId);
            });
        }
    };
    return WidgetsView;
}());
exports.WidgetsView = WidgetsView;
