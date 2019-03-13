"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var widget_1 = require("./widget");
var gamepadHandler_1 = require("../../vrUtils/gamepadHandler");
var GamepadsWidget = /** @class */ (function (_super) {
    tslib_1.__extends(GamepadsWidget, _super);
    function GamepadsWidget(parameters) {
        var _this = _super.call(this) || this;
        _this.widgetId = 'l3graph-gamepad-widget';
        _this.gamepadHandler = parameters.gamepadHandler;
        _this.gamepadHandler.on('keyDown', _this.forceUpdate);
        _this.gamepadHandler.on('keyUp', _this.forceUpdate);
        return _this;
    }
    GamepadsWidget.prototype.onRemove = function () {
        this.gamepadHandler.unsubscribe(this.forceUpdate);
        this.gamepadHandler.unsubscribe(this.forceUpdate);
    };
    Object.defineProperty(GamepadsWidget.prototype, "state", {
        get: function () {
            var gpNumber = this.gamepadHandler.activeGamepadNumber;
            return {
                gpNumber: gpNumber,
                leftGamepad: gpNumber > 0 ? {
                    id: gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER,
                    triggerPressed: this.gamepadHandler.keyPressed.has(gamepadHandler_1.GAMEPAD_BUTTONS.LEFT_TRIGGER)
                } : undefined,
                rightGamepad: gpNumber > 1 ? {
                    id: gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER,
                    triggerPressed: this.gamepadHandler.keyPressed.has(gamepadHandler_1.GAMEPAD_BUTTONS.RIGHT_TRIGGER)
                } : undefined,
            };
        },
        enumerable: true,
        configurable: true
    });
    return GamepadsWidget;
}(widget_1.Widget));
exports.GamepadsWidget = GamepadsWidget;
