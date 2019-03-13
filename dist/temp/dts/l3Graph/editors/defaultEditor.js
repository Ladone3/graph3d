"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var link_1 = require("../models/graph/link");
var node_1 = require("../models/graph/node");
var WHEEL_STEP = 100;
var MIN_DISTANCE_TO_CAMERA = 10;
var DefaultEditor = /** @class */ (function () {
    function DefaultEditor(diagramModel, diagramView, mouseHandler, keyHandler) {
        var _this = this;
        this.diagramModel = diagramModel;
        this.diagramView = diagramView;
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
        this.mouseHandler.on('elementStartDrag', function (e) {
            _this.onElementDrag(e.data.nativeEvent, e.data.element);
        });
        this.mouseHandler.on('elementDrag', function (e) {
            _this.onElementDrag(e.data.nativeEvent, e.data.element);
        });
        this.mouseHandler.on('elementEndDrag', function (e) {
            _this.onElementDragEnd(e.data.nativeEvent, e.data.element);
        });
        this.keyHandler.on('keyPressed', function (e) { return _this.onKeyPressed(e.data); });
    }
    DefaultEditor.prototype.onKeyPressed = function (keyMap) {
        if (keyMap.has(utils_1.KEY_CODES.DELETE) && this.diagramModel.selection.elements.size > 0) {
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
    DefaultEditor.prototype.onElementDrag = function (event, target) {
        if (target instanceof link_1.Link) {
            return;
        }
        if (event instanceof TouchEvent && event.touches.length === 0) {
            return;
        }
        var nodeThreePos = utils_1.vector3dToTreeVector3(target.position);
        var cameraPos = this.diagramView.camera.position;
        var distanceToNode = nodeThreePos.distanceTo(cameraPos);
        if (isMouseWheelEvent(event)) {
            var delta = -(event.deltaX || event.deltaY || event.deltaZ);
            distanceToNode += (delta > 0 ? 1 : -1) * WHEEL_STEP;
        }
        var size = target.size;
        var minDist = Math.max(size.x, size.y, size.z) / 2 + MIN_DISTANCE_TO_CAMERA;
        var limitedDistance = Math.max(distanceToNode, minDist);
        var newNodePosition = this.diagramView.mouseTo3dPos(event, limitedDistance);
        target.setPosition(newNodePosition);
    };
    DefaultEditor.prototype.onElementDragEnd = function (event, target) {
        this.onElementDrag(event, target);
    };
    return DefaultEditor;
}());
exports.DefaultEditor = DefaultEditor;
function isMouseWheelEvent(e) {
    return Boolean(e.deltaX || e.deltaY || e.deltaZ);
}
