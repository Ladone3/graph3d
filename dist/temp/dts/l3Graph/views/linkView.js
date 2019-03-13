"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var templates_1 = require("../templates");
var utils_1 = require("../utils");
var LinkView = /** @class */ (function () {
    function LinkView(model, customTemplate) {
        this.model = model;
        var template = tslib_1.__assign({}, templates_1.DEFAULT_LINK_TEMPLATE, customTemplate);
        this.boundingBox = new THREE.Box3();
        // It's implemented this way because:
        // 1 - lines can't have thikness on Windows OS,
        // 2 - There is bug with lines when they are too close to the camera
        // There is simpleLinkView.ts - you can check the behavior
        var lineGeometry1 = new THREE.PlaneGeometry(1, 0.5 * template.thickness, 1, 1);
        var lineMaterial1 = new THREE.MeshBasicMaterial({ color: template.color, side: THREE.DoubleSide });
        var line1 = new THREE.Mesh(lineGeometry1, lineMaterial1);
        var line2 = new THREE.Mesh(lineGeometry1, lineMaterial1);
        line2.rotateX(Math.PI / 2);
        this.lineMesh = new THREE.Group();
        this.lineMesh.add(line1);
        this.lineMesh.add(line2);
        this.arrowGeometry = new THREE.ConeGeometry(2, 10, 4);
        this.arrowMaterial = new THREE.MeshBasicMaterial({ color: template.color });
        this.arrow = new THREE.Mesh(this.arrowGeometry, this.arrowMaterial);
        this.mesh = new THREE.Group();
        this.mesh.add(this.lineMesh);
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
    LinkView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    LinkView.prototype.update = function () {
        var sourcePos = this.model.source.position;
        var targetPos = this.model.target.position;
        var dist = utils_1.vector3DToTreeVector3(sourcePos).distanceTo(utils_1.vector3DToTreeVector3(targetPos));
        var position = utils_1.vector3DToTreeVector3({
            x: (sourcePos.x + targetPos.x) / 2,
            y: (sourcePos.y + targetPos.y) / 2,
            z: (sourcePos.z + targetPos.z) / 2,
        });
        var lookAtPostion = {
            x: targetPos.x + 0.00001,
            y: targetPos.y + 0.00001,
            z: targetPos.z + 0.00001,
        };
        this.arrow.position.copy(position);
        this.arrow.lookAt(lookAtPostion.x, lookAtPostion.y, lookAtPostion.z);
        this.arrow.rotateX(Math.PI / 2);
        this.lineMesh.position.copy(position);
        this.lineMesh.lookAt(lookAtPostion.x, lookAtPostion.y, lookAtPostion.z);
        this.lineMesh.rotateY(Math.PI / 2);
        this.lineMesh.scale.set(dist, 1, 1);
        // Update overlay
        if (this.overlay) {
            this.overlay.position.copy(position);
        }
    };
    return LinkView;
}());
exports.LinkView = LinkView;
