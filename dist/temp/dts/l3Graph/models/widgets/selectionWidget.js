Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var widget_1 = require("./widget");
var node_1 = require("../graph/node");
var SelectionWidget = (function (_super) {
    tslib_1.__extends(SelectionWidget, _super);
    function SelectionWidget(parameters) {
        var _this = _super.call(this) || this;
        _this.widgetId = 'l3graph-selection-widget';
        _this.diagramModel = parameters.diagramModel;
        _this.diagramModel.selection.on('change', function (e) {
            var previousSelection = e.data;
            _this.updateSubscription(previousSelection);
        });
        return _this;
    }
    Object.defineProperty(SelectionWidget.prototype, "selectedElements", {
        get: function () {
            var elements = [];
            this.diagramModel.selection.elements.forEach(function (el) { return elements.push(el); });
            return elements;
        },
        enumerable: true,
        configurable: true
    });
    SelectionWidget.prototype.updateSubscription = function (previousSelection) {
        var _this = this;
        if (previousSelection) {
            previousSelection.forEach(function (el) {
                el.unsubscribeFromAll(_this.forceUpdate);
            });
        }
        var newSelection = this.diagramModel.selection.elements;
        if (newSelection.size > 0) {
            newSelection.forEach(function (el) {
                if (el instanceof node_1.Node) {
                    el.on('change:position', _this.forceUpdate);
                    el.on('change:size', _this.forceUpdate);
                }
            });
        }
        this.forceUpdate();
    };
    return SelectionWidget;
}(widget_1.Widget));
exports.SelectionWidget = SelectionWidget;
