"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var LINES_LENGTH = 100;
var ArrowHelperView = /** @class */ (function () {
    function ArrowHelperView(parameters) {
        this.model = parameters.model;
        this.mesh = new THREE.Group();
        // x
        var geometryX = new THREE.Geometry();
        geometryX.vertices.push(new THREE.Vector3(0, 0, 0));
        geometryX.vertices.push(new THREE.Vector3(LINES_LENGTH, 0, 0));
        var lineX = new THREE.Line(geometryX, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        var arrowX = new THREE.Mesh(new THREE.ConeGeometry(5, 20, 4), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        arrowX.position.copy(geometryX.vertices[1]);
        arrowX.rotateZ(-Math.PI / 2);
        this.mesh.add(lineX);
        this.mesh.add(arrowX);
        // y
        var geometryY = new THREE.Geometry();
        geometryY.vertices.push(new THREE.Vector3(0, 0, 0));
        geometryY.vertices.push(new THREE.Vector3(0, LINES_LENGTH, 0));
        var lineY = new THREE.Line(geometryY, new THREE.LineBasicMaterial({ color: 0x0000ff }));
        var arrowY = new THREE.Mesh(new THREE.ConeGeometry(5, 20, 4), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
        arrowY.position.copy(geometryY.vertices[1]);
        this.mesh.add(lineY);
        this.mesh.add(arrowY);
        // z
        var geometryZ = new THREE.Geometry();
        geometryZ.vertices.push(new THREE.Vector3(0, 0, 0));
        geometryZ.vertices.push(new THREE.Vector3(0, 0, LINES_LENGTH));
        var lineZ = new THREE.Line(geometryZ, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        var arrowZ = new THREE.Mesh(new THREE.ConeGeometry(5, 20, 4), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        arrowZ.position.copy(geometryZ.vertices[1]);
        arrowZ.rotateX(Math.PI / 2);
        this.mesh.add(lineZ);
        this.mesh.add(arrowZ);
        this.boundingBox = new THREE.Box3();
        this.boundingBox.setFromObject(this.mesh);
        this.update();
    }
    ArrowHelperView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    ArrowHelperView.prototype.update = function () {
        var isWidgetVisible = this.model.isVisible;
        this.mesh.visible = isWidgetVisible;
        var position = isWidgetVisible ? this.model.focusNode.position : { x: 0, y: 0, z: 0 };
        this.mesh.position.set(position.x, position.y, position.z);
    };
    return ArrowHelperView;
}());
exports.ArrowHelperView = ArrowHelperView;
