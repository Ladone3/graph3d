"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribeable_1 = require("../utils/subscribeable");
var ArrowHelper = /** @class */ (function (_super) {
    tslib_1.__extends(ArrowHelper, _super);
    function ArrowHelper(parameters) {
        if (parameters === void 0) { parameters = {}; }
        var _this = _super.call(this) || this;
        _this.updateView = function () {
            _this.trigger('update:widget', _this);
        };
        _this.widgetId = 'o3d-arrow-helper-widget';
        _this.focusNode = parameters.focusNode;
        return _this;
    }
    Object.defineProperty(ArrowHelper.prototype, "focusNode", {
        get: function () {
            return this._focusNode;
        },
        set: function (target) {
            if (target !== this._focusNode) {
                if (this._focusNode) {
                    this._focusNode.unsubscribe(this.updateView);
                }
                if (target) {
                    target.on('change:position', this.updateView);
                }
            }
            this._focusNode = target;
            this.updateView();
        },
        enumerable: true,
        configurable: true
    });
    return ArrowHelper;
}(subscribeable_1.Subscribable));
exports.ArrowHelper = ArrowHelper;
