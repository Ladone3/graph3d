"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodeWidget_1 = require("./nodeWidget");
var node_1 = require("../graph/node");
var FocusNodeWidget = /** @class */ (function (_super) {
    tslib_1.__extends(FocusNodeWidget, _super);
    function FocusNodeWidget(parameters) {
        var _this = _super.call(this, parameters) || this;
        var selection = parameters.diagramModel.selection;
        selection.on('change', function () {
            var selectedElements = selection.elements;
            if (selectedElements.size === 1) {
                selectedElements.forEach(function (element) {
                    if (element instanceof node_1.Node) {
                        _this.setFocusNode(element);
                    }
                });
            }
            else {
                _this.setFocusNode(null);
            }
        });
        return _this;
    }
    return FocusNodeWidget;
}(nodeWidget_1.NodeWidget));
exports.FocusNodeWidget = FocusNodeWidget;
