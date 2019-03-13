Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var customization_1 = require("../../customization");
var shapeUtils_1 = require("../../utils/shapeUtils");
var utils_1 = require("../../utils");
var overlayAnchor_1 = require("./overlayAnchor");
var overlay3DAnchor_1 = require("./overlay3DAnchor");
var selectionView_1 = require("../widgets/selectionView");
var NodeView = (function () {
    function NodeView(model, template) {
        this.model = model;
        this.boundingBox = new THREE.Box3();
        var meshDescriptor = template.mesh();
        this.preserveRatio = meshDescriptor.preserveRatio || meshDescriptor.preserveRatio === undefined;
        if (meshDescriptor) {
            if (meshDescriptor.type === customization_1.MeshKind.ThreeNative) {
                this.mesh = meshDescriptor.mesh;
            }
            else if (meshDescriptor.type === customization_1.MeshKind.Primitive) {
                this.mesh = shapeUtils_1.preparePrimitive(meshDescriptor);
            }
            else if (meshDescriptor.type === customization_1.MeshKind.Obj) {
                this.mesh = shapeUtils_1.prepareMesh(meshDescriptor);
            }
            this.boundingBox.setFromObject(this.mesh)
                .getCenter(this.mesh.position)
                .multiplyScalar(-1);
            this.meshOffset = utils_1.threeVector3ToVector3d(this.mesh.position);
            this.meshOriginalSize = this.boundingBox.getSize(this.mesh.position).clone();
            if (meshDescriptor.size && this.model.size.placeholder) {
                this.model.setSize(meshDescriptor.size);
            }
        }
        else {
            this.mesh = null;
        }
        this.overlayAnchor = new NodeOverlayAnchor(this.model, this);
        if (template.overlay) {
            this.overlayAnchor.setOverlay(template.overlay, 'e');
        }
        this.overlayAnchor3d = new NodeOverlayAnchor3d(this.model, this, this.overlayAnchor);
        this.update();
    }
    NodeView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    NodeView.prototype.update = function () {
        var position = this.model.position;
        if (this.mesh) {
            var scale = this.calcScale();
            this.mesh.scale.set(scale.x, scale.y, scale.z);
            this.boundingBox.setFromObject(this.mesh)
                .getCenter(this.mesh.position)
                .multiplyScalar(-1);
            this.mesh.position.set(position.x + this.meshOffset.x * scale.x, position.y + this.meshOffset.y * scale.y, position.z + this.meshOffset.z * scale.z);
        }
        this.overlayAnchor.update();
        this.overlayAnchor3d.update();
    };
    NodeView.prototype.calcScale = function () {
        var size = this.meshOriginalSize;
        var preferredSize = this.model.size;
        var scale = {
            x: preferredSize.x / size.x,
            y: preferredSize.y / size.y,
            z: preferredSize.z / size.z,
        };
        if (this.preserveRatio) {
            var singleScale = Math.min(scale.x, scale.y, scale.z);
            return {
                x: singleScale,
                y: singleScale,
                z: singleScale,
            };
        }
        else {
            return scale;
        }
    };
    return NodeView;
}());
exports.NodeView = NodeView;
var NodeOverlayAnchor = (function (_super) {
    tslib_1.__extends(NodeOverlayAnchor, _super);
    function NodeOverlayAnchor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NodeOverlayAnchor.prototype.getModelFittingBox = function () {
        return tslib_1.__assign(tslib_1.__assign({}, this.meshModel.position), utils_1.getModelFittingBox(this.meshModel.size));
    };
    NodeOverlayAnchor.prototype.enrichOverlay = function (poorOverlay) {
        return customization_1.enrichOverlay(poorOverlay, this.meshModel);
    };
    return NodeOverlayAnchor;
}(overlayAnchor_1.AbstractOverlayAnchor));
exports.NodeOverlayAnchor = NodeOverlayAnchor;
var NodeOverlayAnchor3d = (function (_super) {
    tslib_1.__extends(NodeOverlayAnchor3d, _super);
    function NodeOverlayAnchor3d() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NodeOverlayAnchor3d.prototype.forceUpdate = function () {
        this.meshModel.forceUpdate();
    };
    NodeOverlayAnchor3d.prototype.updatePosition = function () {
        this.mesh.position.copy(utils_1.vector3dToTreeVector3(this.meshView.model.position));
    };
    NodeOverlayAnchor3d.prototype.placeSprites = function (renderedSprites) {
        var spritesByPositions = new Map();
        for (var _i = 0, renderedSprites_1 = renderedSprites; _i < renderedSprites_1.length; _i++) {
            var renderedSprite = renderedSprites_1[_i];
            if (!spritesByPositions.has(renderedSprite.position)) {
                spritesByPositions.set(renderedSprite.position, []);
            }
            spritesByPositions.get(renderedSprite.position).push(renderedSprite);
        }
        var initialOffset = {
            x: this.meshModel.size.x / 2 + selectionView_1.SELECTION_PADDING,
            y: this.meshModel.size.y / 2 + selectionView_1.SELECTION_PADDING,
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
    return NodeOverlayAnchor3d;
}(overlay3DAnchor_1.AbstractOverlayAnchor3d));
exports.NodeOverlayAnchor3d = NodeOverlayAnchor3d;
