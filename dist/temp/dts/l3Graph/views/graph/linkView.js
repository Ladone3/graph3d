"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var React = require("react");
var customisation_1 = require("../../customisation");
var utils_1 = require("../../utils");
var overlayAnchor_1 = require("./overlayAnchor");
var linkRouter_1 = require("../../utils/linkRouter");
var overlay3DAnchor_1 = require("./overlay3DAnchor");
var selectionView_1 = require("../widgets/selectionView");
var ARROW_LENGTH = 10;
var LinkView = /** @class */ (function () {
    function LinkView(model, router, template) {
        this.model = model;
        this.router = router;
        this.template = template;
        this.polyline = [];
        this.model = model;
        this.boundingBox = new THREE.Box3();
        // Mesh
        this.mesh = new THREE.Group();
        this.arrowGeometry = new THREE.ConeGeometry(2, ARROW_LENGTH, 4);
        this.arrowMaterial = new THREE.MeshBasicMaterial({ color: template.color });
        this.arrow = new THREE.Mesh(this.arrowGeometry, this.arrowMaterial);
        this.mesh.add(this.arrow);
        this.lines = [];
        // Overlay
        this.overlayAnchor = new LinkOverlayAnchor(this.model, this);
        if (this.model.data) {
            this.overlayAnchor.setOverlay(customisation_1.enrichOverlay(customisation_1.DEFAULT_LINK_OVERLAY, this.model.data), 'c');
        }
        this.overlayAnchor3d = new LinkOverlayAnchor3d(this.model, this, this.overlayAnchor);
        this.update();
    }
    // Not implemented yet
    LinkView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    LinkView.prototype.update = function () {
        var polyline = this.router.getRout(this.model);
        var lineNumber = polyline.length - 1;
        if (this.lines.length !== lineNumber) {
            for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
                var line = _a[_i];
                this.mesh.remove(line);
            }
            for (var i = 0; i < lineNumber; i++) {
                var line = createLine(this.template);
                this.lines.push(line);
                this.mesh.add(line);
            }
        }
        this.lines.forEach(function (line, index) {
            stretchLineBetween(line, polyline[index], polyline[index + 1]);
        });
        var endPoint = polyline[polyline.length - 1];
        var perEndPoint = polyline[polyline.length - 2];
        var lastSegment = [perEndPoint, endPoint];
        var arrowPosition = linkRouter_1.getPointAlongPolylineByRatio(lastSegment, 0.5);
        this.arrow.position.set(arrowPosition.x, arrowPosition.y, arrowPosition.z);
        this.arrow.lookAt(endPoint.x, endPoint.y, endPoint.z);
        this.arrow.rotateX(Math.PI / 2);
        this.polyline = polyline;
        // Update overlay
        this.overlayAnchor.update();
        this.overlayAnchor3d.update();
    };
    return LinkView;
}());
exports.LinkView = LinkView;
// It is not completed, but for now it's enough
var LinkOverlayAnchor = /** @class */ (function (_super) {
    tslib_1.__extends(LinkOverlayAnchor, _super);
    function LinkOverlayAnchor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.overlayedGroup = function (props) {
            return React.createElement("div", { key: "overlay-group-" + props.position, className: "l3g-link-html-overlay l3g-position-" + props.position },
                React.createElement("div", { className: 'l3g-link-html-overlay__body' }, props.children));
        };
        return _this;
    }
    LinkOverlayAnchor.prototype.getModelFittingBox = function () {
        var polyline = this.meshView.polyline;
        if (polyline.length > 0) {
            var endPoint = polyline[polyline.length - 1];
            var perEndPoint = polyline[polyline.length - 2];
            var lastSegment = [perEndPoint, endPoint];
            var _a = linkRouter_1.getPointAlongPolylineByRatio(lastSegment, 0.5), x = _a.x, y = _a.y, z = _a.z;
            return { x: x, y: y, z: z, width: 0, height: 0, deep: 0 };
        }
        else {
            return { x: 0, y: 0, z: 0, width: 0, height: 0, deep: 0 };
        }
    };
    return LinkOverlayAnchor;
}(overlayAnchor_1.AbstractOverlayAnchor));
exports.LinkOverlayAnchor = LinkOverlayAnchor;
// The same here
var LinkOverlayAnchor3d = /** @class */ (function (_super) {
    tslib_1.__extends(LinkOverlayAnchor3d, _super);
    function LinkOverlayAnchor3d() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LinkOverlayAnchor3d.prototype.forceUpdate = function () {
        this.meshModel.forceUpdate();
    };
    LinkOverlayAnchor3d.prototype.updatePosition = function () {
        var fittingBox = this.overlayAnchor.getModelFittingBox();
        this.mesh.position.copy(utils_1.vector3dToTreeVector3(fittingBox));
    };
    LinkOverlayAnchor3d.prototype.placeSprites = function (renderedSprites) {
        var spritesByPositions = new Map();
        for (var _i = 0, renderedSprites_1 = renderedSprites; _i < renderedSprites_1.length; _i++) {
            var renderedSprite = renderedSprites_1[_i];
            if (!spritesByPositions.has(renderedSprite.position)) {
                spritesByPositions.set(renderedSprite.position, []);
            }
            spritesByPositions.get(renderedSprite.position).push(renderedSprite);
        }
        var fittingBox = this.overlayAnchor.getModelFittingBox();
        var initialOffset = {
            x: fittingBox.x / 2 + selectionView_1.SELECTION_PADDING,
            y: fittingBox.y / 2 + selectionView_1.SELECTION_PADDING,
            z: 0,
        };
        spritesByPositions.forEach(function (sprites, position) {
            var offset = overlay3DAnchor_1.applyOffset({ x: 0, y: 0, z: 0 }, initialOffset, position);
            for (var _i = 0, sprites_1 = sprites; _i < sprites_1.length; _i++) {
                var renderedSprite = sprites_1[_i];
                renderedSprite.sprite.position.set(offset.x, offset.y, offset.z);
                offset = overlay3DAnchor_1.applyOffset(offset, {
                    x: selectionView_1.SELECTION_PADDING + renderedSprite.size.x,
                    y: selectionView_1.SELECTION_PADDING + renderedSprite.size.y,
                    z: 0,
                }, position);
            }
        });
    };
    return LinkOverlayAnchor3d;
}(overlay3DAnchor_1.AbstracrOverlayAnchor3d));
exports.LinkOverlayAnchor3d = LinkOverlayAnchor3d;
// It's implemented this way because:
// 1 - lines can't have thikness on Windows OS,
// 2 - There is bug with lines when they are too close to the camera
// There is simpleLinkView.ts - you can check the behavior
function createLine(template) {
    var lineGeometry = new THREE.PlaneGeometry(1, 0.5 * template.thickness, 1, 1);
    var lineMaterial = new THREE.MeshBasicMaterial({ color: template.color, side: THREE.DoubleSide });
    var line1 = new THREE.Mesh(lineGeometry, lineMaterial);
    var line2 = new THREE.Mesh(lineGeometry, lineMaterial);
    line2.rotateX(Math.PI / 2);
    var lineMesh = new THREE.Group();
    lineMesh.add(line1);
    lineMesh.add(line2);
    return lineMesh;
}
function stretchLineBetween(line, from, to) {
    var mediana = utils_1.multiply(utils_1.sum(from, to), 0.5);
    var dist = utils_1.distance(from, to);
    line.position.set(mediana.x, mediana.y, mediana.z);
    line.lookAt(to.x, to.y, to.z);
    line.rotateY(Math.PI / 2);
    line.scale.set(dist, 1, 1);
}
