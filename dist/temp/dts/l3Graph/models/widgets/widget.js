"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribeable_1 = require("../../utils/subscribeable");
exports.DEFAULT_SELECTION_TYPE_ID = 'l3graph-selection';
var Widget = /** @class */ (function (_super) {
    tslib_1.__extends(Widget, _super);
    function Widget() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.forceUpdate = function () {
            _this.trigger('update:widget');
        };
        return _this;
    }
    return Widget;
}(subscribeable_1.Subscribable));
exports.Widget = Widget;
