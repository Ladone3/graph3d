"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribeable_1 = require("../utils/subscribeable");
var WidgetsModel = /** @class */ (function (_super) {
    tslib_1.__extends(WidgetsModel, _super);
    function WidgetsModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.widgets = new Map();
        return _this;
    }
    WidgetsModel.prototype.registerWidget = function (widget) {
        this.subscribeOnWidget(widget);
        this.widgets.set(widget.widgetId, widget);
        this.trigger('add:widget', widget);
    };
    WidgetsModel.prototype.removeWidget = function (widget) {
        this.unsubscribeFromElement(widget);
        this.widgets.delete(widget.widgetId);
        this.trigger('remove:widget', widget);
    };
    WidgetsModel.prototype.subscribeOnWidget = function (widget) {
        var _this = this;
        widget.on('widget:update', function (event) { return _this.performUpdate(widget); });
    };
    WidgetsModel.prototype.unsubscribeFromElement = function (widget) {
        // if (isNode(widget)) {
        //     widget.on('');
        // } else if (isLink(widget)) {
        // }
    };
    WidgetsModel.prototype.performUpdate = function (widget) {
        this.trigger('widget:update', widget);
    };
    return WidgetsModel;
}(subscribeable_1.Subscribable));
exports.WidgetsModel = WidgetsModel;
