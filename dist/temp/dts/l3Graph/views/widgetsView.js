"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var selectionView_1 = require("./selectionView");
var arrowHelperView_1 = require("./arrowHelperView");
var WidgetsView = /** @class */ (function () {
    function WidgetsView(props) {
        var _this = this;
        this.props = props;
        this.views = new Map();
        this.widgetsModel = props.widgetsModel;
        this.scene = props.scene;
        this.widgetsModel.widgets.forEach(function (widget) { return _this.addWidgetView(widget); });
    }
    WidgetsView.prototype.addWidgetView = function (widget) {
        var widgetViewExists = this.views.get(widget.widgetId);
        if (widgetViewExists) {
            return; // We already have view for this widget
        }
        var view = this.findViewForWidget(widget);
        if (view) {
            if (view.mesh) {
                this.scene.add(view.mesh);
            }
            if (view.overlay) {
                this.scene.add(view.overlay);
            }
            this.views.set(widget.widgetId, view);
        }
    };
    WidgetsView.prototype.removeWidgetView = function (widget) {
        var view = this.views.get(widget.widgetId);
        if (view) {
            if (view.mesh) {
                this.scene.remove(view.mesh);
            }
            if (view.overlay) {
                this.scene.remove(view.overlay);
            }
        }
        this.views.delete(widget.widgetId);
    };
    WidgetsView.prototype.findViewForWidget = function (model) {
        if (model.widgetId === 'o3d-arrow-helper-widget') {
            return new arrowHelperView_1.ArrowHelperView(model);
        }
        else if (model.widgetId === 'o3d-selection-widget') {
            return new selectionView_1.SelectionView(model);
        }
        else {
            return undefined;
        }
    };
    WidgetsView.prototype.update = function (specificIds) {
        if (specificIds) {
            for (var _i = 0, specificIds_1 = specificIds; _i < specificIds_1.length; _i++) {
                var id = specificIds_1[_i];
                var view = this.views.get(id);
                if (view) {
                    view.update();
                }
            }
        }
        else {
            this.views.forEach(function (view) {
                view.update();
            });
        }
    };
    return WidgetsView;
}());
exports.WidgetsView = WidgetsView;
