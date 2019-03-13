"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodeWidget_1 = require("./nodeWidget");
var node_1 = require("../graph/node");
var ArrowHelper = /** @class */ (function (_super) {
    tslib_1.__extends(ArrowHelper, _super);
    function ArrowHelper(parameters) {
        var _this = _super.call(this, { widgetId: 'l3graph-arrow-helper-widget' }) || this;
        _this.mouseHandler = parameters.mouseHandler;
        _this.mouseHandler.on('elementStartDrag', function () {
            var draggedElement = _this.mouseHandler.draggedElement;
            if (draggedElement instanceof node_1.Node) {
                _this.setFocusNode(draggedElement);
            }
        });
        _this.mouseHandler.on('elementEndDrag', function () {
            _this.setFocusNode(undefined);
        });
        return _this;
    }
    Object.defineProperty(ArrowHelper.prototype, "isVisible", {
        get: function () {
            return this.mouseHandler.isDragging;
        },
        enumerable: true,
        configurable: true
    });
    return ArrowHelper;
}(nodeWidget_1.NodeWidget));
exports.ArrowHelper = ArrowHelper;
