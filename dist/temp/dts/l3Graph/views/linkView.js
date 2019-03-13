"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var templates_1 = require("../templates");
var utils_1 = require("../utils");
var LINK_OFFSET = 30;
var ARROW_LENGTH = 10;
var LinkView = /** @class */ (function () {
    function LinkView(model, group, customTemplate) {
        this.model = model;
        this.group = group;
        var template = tslib_1.__assign({}, templates_1.DEFAULT_LINK_TEMPLATE, customTemplate);
        this.boundingBox = new THREE.Box3();
        // Mesh
        this.mesh = new THREE.Group();
        this.arrowGeometry = new THREE.ConeGeometry(2, ARROW_LENGTH, 4);
        this.arrowMaterial = new THREE.MeshBasicMaterial({ color: template.color });
        this.arrow = new THREE.Mesh(this.arrowGeometry, this.arrowMaterial);
        this.mesh.add(this.arrow);
        if (group.links.length > 1) {
            this.lines = [this.createLine(template), this.createLine(template)];
            this.mesh.add(this.lines[0]);
            this.mesh.add(this.lines[1]);
        }
        else {
            this.lines = [this.createLine(template)];
            this.mesh.add(this.lines[0]);
        }
        // Overlay
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
        var mediana = utils_1.multiply(utils_1.sum(sourcePos, targetPos), 0.5);
        var overlayPosition;
        if (this.lines.length === 1) {
            this.stretchLineBetween(this.lines[0], sourcePos, targetPos);
            overlayPosition = mediana;
            this.arrow.position.set(mediana.x, mediana.y, mediana.z);
            this.arrow.lookAt(targetPos.x, targetPos.y, targetPos.z);
            this.arrow.rotateX(Math.PI / 2);
        }
        else {
            var linkIndex = this.group.links.indexOf(this.model);
            var groupSize = this.group.links.length;
            var inverseDirection = this.model._sourceId === this.group.targetId;
            var angle = (2 * Math.PI / groupSize) * (linkIndex + 1);
            // Calculate the kink point
            var originalDirection = utils_1.normalize(utils_1.sub(sourcePos, targetPos));
            var direction = inverseDirection ? utils_1.inverse(originalDirection) : originalDirection;
            var dirRight = utils_1.normalRight(direction);
            var dirUp = utils_1.normalUp(direction);
            var offsetDir = utils_1.normalize(utils_1.sum(utils_1.multiply(dirRight, Math.cos(angle)), utils_1.multiply(dirUp, Math.sin(angle))));
            var offset = utils_1.multiply(offsetDir, groupSize > 1 ? LINK_OFFSET : 0);
            var kinkPoint = utils_1.sum(mediana, offset);
            // Move arrow
            this.arrow.position.set(kinkPoint.x, kinkPoint.y, kinkPoint.z);
            // Stretch lines
            this.stretchLineBetween(this.lines[0], sourcePos, kinkPoint);
            this.stretchLineBetween(this.lines[1], kinkPoint, targetPos);
            // Orient arrow
            var mediana2 = utils_1.multiply(utils_1.sum(kinkPoint, targetPos), 0.5);
            this.arrow.position.set(mediana2.x, mediana2.y, mediana2.z);
            this.arrow.lookAt(targetPos.x, targetPos.y, targetPos.z);
            this.arrow.rotateX(Math.PI / 2);
            // Set overlay position
            overlayPosition = kinkPoint;
        }
        // Update overlay
        if (this.overlay) {
            this.overlay.position.set(overlayPosition.x, overlayPosition.y, overlayPosition.z);
        }
    };
    // It's implemented this way because:
    // 1 - lines can't have thikness on Windows OS,
    // 2 - There is bug with lines when they are too close to the camera
    // There is simpleLinkView.ts - you can check the behavior
    LinkView.prototype.createLine = function (template) {
        var lineGeometry = new THREE.PlaneGeometry(1, 0.5 * template.thickness, 1, 1);
        var lineMaterial = new THREE.MeshBasicMaterial({ color: template.color, side: THREE.DoubleSide });
        var line1 = new THREE.Mesh(lineGeometry, lineMaterial);
        var line2 = new THREE.Mesh(lineGeometry, lineMaterial);
        line2.rotateX(Math.PI / 2);
        var lineMesh = new THREE.Group();
        lineMesh.add(line1);
        lineMesh.add(line2);
        return lineMesh;
    };
    LinkView.prototype.stretchLineBetween = function (line, from, to) {
        var mediana = utils_1.multiply(utils_1.sum(from, to), 0.5);
        var dist = utils_1.distance(from, to);
        line.position.set(mediana.x, mediana.y, mediana.z);
        line.lookAt(to.x, to.y, to.z);
        line.rotateY(Math.PI / 2);
        line.scale.set(dist, 1, 1);
    };
    return LinkView;
}());
exports.LinkView = LinkView;
