"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribeable_1 = require("../utils/subscribeable");
var graphModel_1 = require("./graphModel");
var Selection = /** @class */ (function (_super) {
    tslib_1.__extends(Selection, _super);
    function Selection(parameters) {
        if (parameters === void 0) { parameters = {}; }
        var _this = _super.call(this) || this;
        _this.updateView = function () {
            _this.trigger('update:widget', _this);
        };
        _this.widgetId = 'o3d-selection-widget';
        _this._selection = parameters.selection || new Set();
        return _this;
    }
    Object.defineProperty(Selection.prototype, "selection", {
        get: function () {
            return this._selection;
        },
        set: function (selection) {
            var _this = this;
            selection = selection || new Set();
            if (this._selection !== selection) {
                if (this._selection) {
                    this._selection.forEach(function (el) {
                        el.unsubscribe(_this.updateView);
                    });
                }
                if (selection) {
                    selection.forEach(function (el) {
                        if (graphModel_1.isNode(el)) {
                            el.on('change:position', _this.updateView);
                        }
                    });
                }
            }
            this._selection = selection;
            this.updateView();
        },
        enumerable: true,
        configurable: true
    });
    return Selection;
}(subscribeable_1.Subscribable));
exports.Selection = Selection;
