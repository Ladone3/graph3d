Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribable_1 = require("../../utils/subscribable");
var WidgetsModel = (function (_super) {
    tslib_1.__extends(WidgetsModel, _super);
    function WidgetsModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.widgetModels = new Map();
        return _this;
    }
    Object.defineProperty(WidgetsModel.prototype, "widgets", {
        get: function () {
            return this.widgetModels;
        },
        enumerable: true,
        configurable: true
    });
    WidgetsModel.prototype.registerWidget = function (widget) {
        this.subscribeOnWidget(widget);
        this.widgetModels.set(widget.widgetId, widget);
        this.trigger('add:widget', widget);
    };
    WidgetsModel.prototype.removeWidget = function (widget) {
        this.unsubscribeFromElement(widget);
        this.widgetModels.delete(widget.widgetId);
        if (widget.onRemove) {
            widget.onRemove();
        }
        this.trigger('remove:widget', widget);
    };
    WidgetsModel.prototype.subscribeOnWidget = function (widget) {
        var _this = this;
        widget.on('update:widget', function () { return _this.trigger('update:widget', widget); });
    };
    WidgetsModel.prototype.unsubscribeFromElement = function (widget) {
    };
    return WidgetsModel;
}(subscribable_1.Subscribable));
exports.WidgetsModel = WidgetsModel;
