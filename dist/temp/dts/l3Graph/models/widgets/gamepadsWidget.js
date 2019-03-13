Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var widget_1 = require("./widget");
var GamepadsWidget = (function (_super) {
    tslib_1.__extends(GamepadsWidget, _super);
    function GamepadsWidget(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.widgetId = 'l3graph-gamepad-widget';
        return _this;
    }
    GamepadsWidget.prototype.onRemove = function () {
        if (this.props.leftTool) {
            this.props.leftTool.discard();
        }
        if (this.props.rightTool) {
            this.props.rightTool.discard();
        }
    };
    return GamepadsWidget;
}(widget_1.Widget));
exports.GamepadsWidget = GamepadsWidget;
