"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var htmlToSprite_1 = require("../../utils/htmlToSprite");
var utils_1 = require("../../utils");
var AbstracrOverlayAnchor3d = /** @class */ (function () {
    function AbstracrOverlayAnchor3d(meshModel, meshView, overlayAnchor) {
        var _this = this;
        this.meshModel = meshModel;
        this.meshView = meshView;
        this.overlayAnchor = overlayAnchor;
        var spriteGroup = new THREE.Sprite();
        var superAfterRender = spriteGroup.onAfterRender;
        spriteGroup.onAfterRender = function (renderer, scene, camera, geometry, material, group) {
            spriteGroup.lookAt(camera.position);
            superAfterRender(renderer, scene, camera, geometry, material, group);
        };
        this.mesh = spriteGroup;
        this.renderSprites();
        overlayAnchor.on('anchor:changed', function () { return _this.renderSprites(); });
    }
    AbstracrOverlayAnchor3d.prototype.update = function () {
        this.updatePosition();
    };
    AbstracrOverlayAnchor3d.prototype.renderSprites = function () {
        var _this = this;
        var spritePromises = [];
        this.overlayAnchor._renderedOverlays.forEach(function (html, id) {
            var position = _this.overlayAnchor._overlayPositions.get(id);
            if (html && position) {
                spritePromises.push(htmlToSprite_1.createSprite(html, position));
            }
        });
        Promise.all(spritePromises).then(function (renderedSprites) {
            if (_this.sprites) {
                for (var _i = 0, _a = _this.sprites; _i < _a.length; _i++) {
                    var renderedSprite = _a[_i];
                    _this.mesh.remove(renderedSprite.sprite);
                }
            }
            _this.placeSprites(renderedSprites);
            for (var _b = 0, renderedSprites_1 = renderedSprites; _b < renderedSprites_1.length; _b++) {
                var renderedSprite = renderedSprites_1[_b];
                _this.mesh.add(renderedSprite.sprite);
            }
            _this.sprites = renderedSprites;
            _this.forceUpdate();
        });
    };
    return AbstracrOverlayAnchor3d;
}());
exports.AbstracrOverlayAnchor3d = AbstracrOverlayAnchor3d;
function applyOffset(basicVector, offset, position) {
    var xOffset = offset.x, yOffset = offset.y;
    var offsetByPossition;
    switch (position) {
        case 'e':
            offsetByPossition = { x: xOffset, y: 0, z: 0 };
            break;
        case 'w':
            offsetByPossition = { x: -xOffset, y: 0, z: 0 };
            break;
        case 'n':
            offsetByPossition = { x: 0, y: -yOffset, z: 0 };
            break;
        case 's':
            offsetByPossition = { x: 0, y: yOffset, z: 0 };
            break;
        case 'ne':
            offsetByPossition = { x: xOffset, y: -yOffset, z: 0 };
            break;
        case 'se':
            offsetByPossition = { x: xOffset, y: yOffset, z: 0 };
            break;
        case 'nw':
            offsetByPossition = { x: -xOffset, y: -yOffset, z: 0 };
            break;
        case 'sw':
            offsetByPossition = { x: -xOffset, y: yOffset, z: 0 };
            break;
        default: offsetByPossition = { x: 0, y: 0, z: 0 };
    }
    return utils_1.sum(basicVector, offsetByPossition);
}
exports.applyOffset = applyOffset;
