"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var templates_1 = require("../templates");
var utils_1 = require("../utils");
var SimpleLinkView = /** @class */ (function () {
    function SimpleLinkView(model, customTemplate) {
        this.model = model;
        var template = tslib_1.__assign({}, templates_1.DEFAULT_LINK_TEMPLATE, customTemplate);
        this.boundingBox = new THREE.Box3();
        this.lineGeometry = new THREE.Geometry();
        this.lineMaterial = new THREE.LineBasicMaterial({ color: template.color });
        this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);
        this.arrowGeometry = new THREE.ConeGeometry(2, 10, 4);
        this.arrowMaterial = new THREE.MeshBasicMaterial({ color: template.color });
        this.arrow = new THREE.Mesh(this.arrowGeometry, this.arrowMaterial);
        this.mesh = new THREE.Group();
        this.mesh.add(this.line);
        this.mesh.add(this.arrow);
        if (this.model.label) {
            this.htmlOverlay = document.createElement('DIV');
            this.htmlOverlay.className = 'o3d-link-html-container';
            this.htmlBody = document.createElement('DIV');
            this.htmlBody.className = 'o3d-link-html-view';
            this.htmlOverlay.appendChild(this.htmlBody);
            this.htmlBody.innerText = this.model.label;
            this.overlay = new THREE.CSS3DSprite(this.htmlOverlay);
        }
        else {
            this.overlay = null;
        }
        this.update();
    }
    // Not implemented yet
    SimpleLinkView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    SimpleLinkView.prototype.update = function () {
        var sourcePos = this.model.source.position;
        var targetPos = this.model.target.position;
        this.lineGeometry.vertices = this.calculateVertices(sourcePos, targetPos);
        this.lineGeometry.verticesNeedUpdate = true;
        var dist = utils_1.vector3DToTreeVector3(sourcePos).distanceTo(utils_1.vector3DToTreeVector3(targetPos));
        var position = utils_1.vector3DToTreeVector3({
            x: (sourcePos.x + targetPos.x) / 2,
            y: (sourcePos.y + targetPos.y) / 2,
            z: (sourcePos.z + targetPos.z) / 2,
        });
        this.arrow.position.copy(position);
        this.arrow.lookAt(targetPos.x + 0.00001, targetPos.y + 0.00001, targetPos.z + 0.00001);
        this.arrow.rotateX(Math.PI / 2);
        // Update overlay
        if (this.overlay) {
            this.overlay.position.copy(position);
        }
    };
    SimpleLinkView.prototype.calculateVertices = function (source, target) {
        return [
            new THREE.Vector3(source.x, source.y, source.z),
            new THREE.Vector3(target.x, target.y, target.z),
        ];
    };
    return SimpleLinkView;
}());
exports.SimpleLinkView = SimpleLinkView;
