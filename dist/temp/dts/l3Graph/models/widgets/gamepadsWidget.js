"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var widget_1 = require("./widget");
var gamepadHandler_1 = require("../../vrUtils/gamepadHandler");
var GamepadsWidget = /** @class */ (function (_super) {
    tslib_1.__extends(GamepadsWidget, _super);
    function GamepadsWidget(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.widgetId = 'l3graph-gamepad-widget';
        if (props.leftTools.length === 0 || props.rightTools.length === 0) {
            throw new Error('Left or Right tool is not provided!');
        }
        _this._tools = {
            leftTool: props.leftTools[0],
            rightTool: props.rightTools[0],
        };
        return _this;
    }
    GamepadsWidget.prototype.onRemove = function () {
        this.props.leftTools.forEach(function (tool) { return tool.onDiscard(); });
        this.props.rightTools.forEach(function (tool) { return tool.onDiscard(); });
    };
    Object.defineProperty(GamepadsWidget.prototype, "tools", {
        get: function () {
            if (this._tools.leftTool.forGamepadId === gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER &&
                this._tools.rightTool.forGamepadId === gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER) {
                return this._tools;
            }
            else if (this._tools.leftTool.forGamepadId === gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER &&
                this._tools.rightTool.forGamepadId === gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                // tslint:disable-next-line: no-console
                console.warn('Please change configuration left gamepad and right one are mixed up!');
                return {
                    leftTool: this._tools.rightTool,
                    rightTool: this._tools.leftTool,
                };
            }
            else {
                // tslint:disable-next-line: no-console
                console.warn('Wrong gamepad tool configuration!');
                return this._tools;
            }
        },
        enumerable: true,
        configurable: true
    });
    return GamepadsWidget;
}(widget_1.Widget));
exports.GamepadsWidget = GamepadsWidget;
