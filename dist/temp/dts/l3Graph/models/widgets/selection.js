"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribeable_1 = require("../../utils/subscribeable");
var Selection = /** @class */ (function (_super) {
    tslib_1.__extends(Selection, _super);
    function Selection(parameters) {
        var _this = _super.call(this) || this;
        _this._elements = parameters.selection || new Set();
        _this.graph = parameters.graph;
        _this.graph.on('remove:elements', function (e) {
            var newSelection = new Set(_this._elements);
            var deletedElements = e.data;
            for (var _i = 0, deletedElements_1 = deletedElements; _i < deletedElements_1.length; _i++) {
                var el = deletedElements_1[_i];
                newSelection.delete(el);
            }
            _this.setSelection(newSelection);
        });
        return _this;
    }
    // todo: make better check of changes
    Selection.prototype.setSelection = function (elements) {
        elements = elements || new Set();
        if (this._elements !== elements) {
            this._elements = elements;
            this.trigger('change');
        }
    };
    Object.defineProperty(Selection.prototype, "elements", {
        get: function () {
            return this._elements;
        },
        enumerable: true,
        configurable: true
    });
    return Selection;
}(subscribeable_1.Subscribable));
exports.Selection = Selection;
