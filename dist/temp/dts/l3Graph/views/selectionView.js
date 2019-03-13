"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var graphModel_1 = require("../models/graphModel");
var utils_1 = require("../utils");
var SELECTION_PADDING = 15;
var SelectionView = /** @class */ (function () {
    function SelectionView(model) {
        this.model = model;
        this.material = new THREE.MeshLambertMaterial({ color: 'red', opacity: 0.1, transparent: true });
        this.geometry = new THREE.CubeGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.overlay = null;
        this.update();
    }
    SelectionView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    SelectionView.prototype.update = function () {
        var points = [];
        this.model.selection.forEach(function (element) {
            if (graphModel_1.isNode(element)) {
                points.push(element.position);
            }
        });
        if (points.length > 0) {
            this.mesh.visible = true;
            var _a = utils_1.calcBounds(points), min = _a.min, max = _a.max, average = _a.average;
            this.mesh.position.set(average.x, average.y, average.z);
            this.mesh.scale.set(max.x - min.x + SELECTION_PADDING * 2, max.y - min.y + SELECTION_PADDING * 2, max.z - min.z + SELECTION_PADDING * 2);
        }
        else {
            this.mesh.visible = false;
        }
    };
    return SelectionView;
}());
exports.SelectionView = SelectionView;
