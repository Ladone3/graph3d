"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var widget_1 = require("./widget");
var NodeWidget = /** @class */ (function (_super) {
    tslib_1.__extends(NodeWidget, _super);
    function NodeWidget(parameters) {
        var _this = _super.call(this) || this;
        _this.widgetId = parameters.widgetId;
        return _this;
    }
    NodeWidget.prototype.setFocusNode = function (target) {
        this._prevFocusNode = this._focusNode;
        this._focusNode = target;
        if (this.isFocusNodeChanged) {
            if (this._prevFocusNode) {
                this._prevFocusNode.unsubscribe('change:position', this.forceUpdate);
            }
            if (this._focusNode) {
                this._focusNode.on('change:position', this.forceUpdate);
            }
        }
        this.forceUpdate();
    };
    Object.defineProperty(NodeWidget.prototype, "isFocusNodeChanged", {
        get: function () {
            return this._prevFocusNode !== this._focusNode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeWidget.prototype, "focusNode", {
        get: function () {
            return this._focusNode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeWidget.prototype, "prevFocusNode", {
        get: function () {
            return this._prevFocusNode;
        },
        enumerable: true,
        configurable: true
    });
    NodeWidget.prototype.onRemove = function () {
        if (this._focusNode) {
            this._focusNode.unsubscribe('change:position', this.forceUpdate);
        }
    };
    return NodeWidget;
}(widget_1.Widget));
exports.NodeWidget = NodeWidget;
