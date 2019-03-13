"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var node_1 = require("../../models/graph/node");
exports.SELECTION_PADDING = 5;
var SelectionView = /** @class */ (function () {
    function SelectionView(parameters) {
        this.model = parameters.model;
        this.material = new THREE.MeshLambertMaterial({ color: 'red', opacity: 0.1, transparent: true });
        this.geometry = new THREE.CubeGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.update();
    }
    SelectionView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    SelectionView.prototype.update = function () {
        var nodes = [];
        for (var _i = 0, _a = this.model.selectedElements; _i < _a.length; _i++) {
            var element = _a[_i];
            if (element instanceof node_1.Node) {
                nodes.push(element);
            }
        }
        if (nodes.length > 0) {
            this.mesh.visible = true;
            var node = nodes[0];
            this.mesh.position.set(node.position.x, node.position.y, node.position.z);
            var nodeSize = typeof node.size === 'number' ? {
                x: node.size,
                y: node.size,
                z: node.size,
            } : node.size;
            this.mesh.scale.set(nodeSize.x + exports.SELECTION_PADDING * 2, nodeSize.y + exports.SELECTION_PADDING * 2, nodeSize.z + exports.SELECTION_PADDING * 2);
        }
        else {
            this.mesh.visible = false;
        }
    };
    return SelectionView;
}());
exports.SelectionView = SelectionView;
