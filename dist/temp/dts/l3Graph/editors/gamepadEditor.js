Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("../models/graph/node");
var GamepadEditor = (function () {
    function GamepadEditor(gamepadHandler) {
        this.gamepadHandler = gamepadHandler;
        this.gamepadHandler.on('elementDrag', function (event) {
            var _a = event.data, target = _a.target, position = _a.position;
            if (target instanceof node_1.Node) {
                target.setPosition(position);
            }
        });
    }
    return GamepadEditor;
}());
exports.GamepadEditor = GamepadEditor;
