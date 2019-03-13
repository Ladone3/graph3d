"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var ReactNodeWidgetView = /** @class */ (function () {
    function ReactNodeWidgetView(parameters) {
        this.model = parameters.model;
        this.position = parameters.position || 'c';
        this.mesh = null;
        this.diagramView = parameters.diagramView;
        this.overlay = parameters.overlay;
        this.htmlOverlay = document.createElement('DIV');
        this.update();
    }
    ReactNodeWidgetView.prototype.getBoundingBox = function () {
        return new THREE.Box3();
    };
    ReactNodeWidgetView.prototype.update = function () {
        if (!this.model.isFocusNodeChanged) {
            return;
        }
        this.clearNode(this.model.prevFocusNode);
        if (this.model.focusNode) {
            var curAnchor = this.diagramView.graphView.nodeViews.get(this.model.focusNode.id).overlayAnchor;
            if (!curAnchor.hasOverlay(this.overlay.id)) {
                curAnchor.setOverlay(this.overlay, this.position);
            }
        }
    };
    ReactNodeWidgetView.prototype.onRemove = function () {
        this.clearNode(this.model.focusNode);
        this.clearNode(this.model.prevFocusNode);
    };
    ReactNodeWidgetView.prototype.clearNode = function (node) {
        if (node && this.overlay) {
            var view = this.diagramView.graphView.nodeViews.get(node.id);
            if (view) {
                var anchor = this.diagramView.graphView.nodeViews.get(node.id).overlayAnchor;
                anchor.removeOverlay(this.overlay.id);
            }
        }
    };
    return ReactNodeWidgetView;
}());
exports.ReactNodeWidgetView = ReactNodeWidgetView;
