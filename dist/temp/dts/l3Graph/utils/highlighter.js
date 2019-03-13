Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("../models/graph/node");
var _1 = require(".");
var SELECTION_COLOR = 'red';
var DEFAULT_HIGHLIGHTER = function (mesh) {
    var backUp = _1.backupColors(mesh);
    _1.setColor(mesh, SELECTION_COLOR);
    return function (meshToRestore) { return _1.restoreColors(meshToRestore, backUp); };
};
var ElementHighlighter = (function () {
    function ElementHighlighter(diagramView, highlighter) {
        if (highlighter === void 0) { highlighter = DEFAULT_HIGHLIGHTER; }
        this.diagramView = diagramView;
        this.highlighter = highlighter;
        this.restorers = new Map();
    }
    ElementHighlighter.prototype.highlight = function (element) {
        if (element instanceof node_1.Node && !this.restorers.has(element)) {
            var elementView = this.diagramView.graphView.nodeViews.get(element);
            this.restorers.set(element, this.highlighter(elementView.mesh));
        }
    };
    ElementHighlighter.prototype.clear = function (element) {
        var restore = this.restorers.get(element);
        if (restore) {
            if (element instanceof node_1.Node) {
                var elementView = this.diagramView.graphView.nodeViews.get(element);
                restore(elementView.mesh);
                this.restorers.delete(element);
            }
        }
    };
    return ElementHighlighter;
}());
exports.ElementHighlighter = ElementHighlighter;
