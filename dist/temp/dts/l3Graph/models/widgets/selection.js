Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribable_1 = require("../../utils/subscribable");
var Selection = (function (_super) {
    tslib_1.__extends(Selection, _super);
    function Selection(parameters) {
        var _this = _super.call(this) || this;
        _this._nodes = parameters.selection || new Set();
        _this.graph = parameters.graph;
        _this.graph.on('remove:nodes', function (e) {
            var newSelection = new Set();
            _this._nodes.forEach(function (n) { return newSelection.add(n); });
            var deletedNodes = e.data;
            for (var _i = 0, deletedNodes_1 = deletedNodes; _i < deletedNodes_1.length; _i++) {
                var node = deletedNodes_1[_i];
                newSelection.delete(node);
            }
            _this.setSelection(newSelection);
        });
        return _this;
    }
    Selection.prototype.setSelection = function (nodes) {
        nodes = nodes || new Set();
        if (this._nodes !== nodes) {
            this._nodes = nodes;
            this.trigger('change');
        }
    };
    Object.defineProperty(Selection.prototype, "elements", {
        get: function () {
            return this._nodes;
        },
        enumerable: true,
        configurable: true
    });
    return Selection;
}(subscribable_1.Subscribable));
exports.Selection = Selection;
