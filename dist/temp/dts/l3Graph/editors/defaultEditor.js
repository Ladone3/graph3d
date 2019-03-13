Object.defineProperty(exports, "__esModule", { value: true });
var keyHandler_1 = require("../input/keyHandler");
var link_1 = require("../models/graph/link");
var node_1 = require("../models/graph/node");
var DefaultEditor = (function () {
    function DefaultEditor(diagramModel, mouseHandler, keyHandler, gamepadHandler) {
        var _this = this;
        this.diagramModel = diagramModel;
        this.mouseHandler = mouseHandler;
        this.keyHandler = keyHandler;
        this.mouseHandler.on('elementClick', function (e) {
            if (e.data.element instanceof node_1.Node && !_this.diagramModel.selection.elements.has(e.data.element)) {
                _this.diagramModel.selection.setSelection(new Set([e.data.element]));
            }
        });
        this.mouseHandler.on('paperClick', function (e) {
            _this.diagramModel.selection.setSelection(new Set());
        });
        this.keyHandler.on('keyPressed', function (e) { return _this.onKeyPressed(e.data); });
        this.subscribeOnDragHandler(mouseHandler);
        this.subscribeOnDragHandler(gamepadHandler);
    }
    DefaultEditor.prototype.subscribeOnDragHandler = function (dragHandler) {
        var _this = this;
        dragHandler.on('elementDragStart', function (e) {
            _this.onElementDrag(e.data.target, e.data.position);
        });
        dragHandler.on('elementDrag', function (e) {
            _this.onElementDrag(e.data.target, e.data.position);
        });
        dragHandler.on('elementDragEnd', function (e) {
            _this.onElementDragEnd(e.data.target, e.data.position);
        });
    };
    DefaultEditor.prototype.onKeyPressed = function (keyMap) {
        if (keyMap.has(keyHandler_1.KEY_CODES.DELETE) && this.diagramModel.selection.elements.size > 0) {
            var nodesToDelete_1 = [];
            var linksToDelete_1 = [];
            this.diagramModel.selection.elements.forEach(function (el) {
                if (el instanceof node_1.Node) {
                    nodesToDelete_1.push(el);
                }
                else {
                    linksToDelete_1.push(el);
                }
            });
            this.diagramModel.graph.removeLinks(linksToDelete_1);
            this.diagramModel.graph.removeNodes(nodesToDelete_1);
        }
    };
    DefaultEditor.prototype.onElementDrag = function (target, position) {
        if (target instanceof link_1.Link) {
            return;
        }
        if (!position) {
            throw new Error('Position can\'t be undefined!');
        }
        target.setPosition(position);
    };
    DefaultEditor.prototype.onElementDragEnd = function (target, position) {
        this.onElementDrag(target, position);
    };
    return DefaultEditor;
}());
exports.DefaultEditor = DefaultEditor;
