Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ReactDOM = require("react-dom");
var React = require("react");
var THREE = require("three");
var customization_1 = require("../../customization");
var utils_1 = require("../../utils");
var CSS3DRenderer_1 = require("../../utils/CSS3DRenderer");
var htmlToSprite_1 = require("../../utils/htmlToSprite");
var AbstractOverlayAnchor = (function (_super) {
    tslib_1.__extends(AbstractOverlayAnchor, _super);
    function AbstractOverlayAnchor(meshModel, meshView) {
        var _this = _super.call(this) || this;
        _this.meshModel = meshModel;
        _this.meshView = meshView;
        _this._renderedOverlays = new Map();
        _this.overlayedGroup = function (props) {
            return React.createElement("div", { key: "overlay-group-" + props.position, className: "l3g-html-overlay l3g-position-" + props.position },
                React.createElement("div", { className: 'l3g-html-overlay-aligner' },
                    React.createElement("div", { className: 'l3g-html-overlay__body' }, props.children)));
        };
        _this.html = document.createElement('DIV');
        _this.sprite = new CSS3DRenderer_1.CSS3DSprite(_this.html);
        _this.overlaysByPosition = new Map();
        _this._overlayPositions = new Map();
        _this.redraw();
        return _this;
    }
    Object.defineProperty(AbstractOverlayAnchor.prototype, "overlays", {
        get: function () {
            return this.overlaysByPosition;
        },
        enumerable: true,
        configurable: true
    });
    AbstractOverlayAnchor.prototype.hasOverlay = function (overlayId) {
        return this._overlayPositions.has(overlayId);
    };
    AbstractOverlayAnchor.prototype.isVisible = function () {
        return this.overlaysByPosition.size > 0;
    };
    AbstractOverlayAnchor.prototype.hide = function () {
        var _this = this;
        this._overlayPositions.forEach(function (p, id) {
            _this.removeOverlay(id);
        });
    };
    AbstractOverlayAnchor.prototype.setOverlay = function (overlay, position) {
        if (!this.overlaysByPosition.has(position)) {
            this.overlaysByPosition.set(position, new Map());
        }
        this.overlaysByPosition.get(position).set(overlay.id, overlay);
        this._overlayPositions.set(overlay.id, position);
        this.redraw();
        this.trigger('anchor:changed');
    };
    AbstractOverlayAnchor.prototype.removeOverlay = function (id) {
        if (!this.hasOverlay(id)) {
            return;
        }
        var position = this._overlayPositions.get(id);
        var overlaysOnPosition = this.overlaysByPosition.get(position);
        overlaysOnPosition.delete(id);
        if (overlaysOnPosition.size === 0) {
            this.overlaysByPosition.delete(position);
        }
        this._overlayPositions.delete(id);
        this._renderedOverlays.delete(id);
        this.redraw();
        this.trigger('anchor:changed');
    };
    AbstractOverlayAnchor.prototype.update = function () {
        if (this.overlaysByPosition.size > 0) {
            var _a = this.getModelFittingBox(), x = _a.x, y = _a.y, z = _a.z;
            this.sprite.position.set(x, y, z);
        }
    };
    AbstractOverlayAnchor.prototype.enrichOverlay = function (poorOverlay) {
        return customization_1.enrichOverlay(poorOverlay, this.meshModel);
    };
    AbstractOverlayAnchor.prototype.redraw = function () {
        var _this = this;
        var OverlayedGroup = this.overlayedGroup;
        if (this.overlaysByPosition.size === 0) {
            ReactDOM.unmountComponentAtNode(this.html);
        }
        else {
            var overlayGroups_1 = [];
            var groupIndex_1 = 0;
            this.overlaysByPosition.forEach(function (overlays, position) {
                var overlayViews = [];
                overlays.forEach(function (poorOverlay, index) {
                    overlayViews.push(React.createElement("div", { key: "overlay-" + index, ref: (function (ref) { return _this._renderedOverlays.set(poorOverlay.id, ref); }) }, _this.renderOverlay(poorOverlay, position)));
                });
                overlayGroups_1.push(React.createElement(OverlayedGroup, { key: "overlay-group-" + position + "-" + groupIndex_1++, position: position }, overlayViews));
            });
            var _a = this.getModelFittingBox(), x = _a.x, y = _a.y, z = _a.z, width = _a.width, height = _a.height;
            this.sprite.position.set(x, y, z);
            ReactDOM.render(React.createElement("div", { className: 'l3g-node-overlay-anchor', style: { width: width, height: height } }, overlayGroups_1), this.html);
        }
    };
    AbstractOverlayAnchor.prototype.renderOverlay = function (poorOverlay, position) {
        var overlay = this.enrichOverlay(poorOverlay);
        var key = "position-" + position + "-" + poorOverlay.id;
        if (overlay.context) {
            var Context = customization_1.createContextProvider(overlay.context);
            return (React.createElement(Context, { key: key }, overlay.value));
        }
        else {
            return overlay.value;
        }
    };
    return AbstractOverlayAnchor;
}(utils_1.Subscribable));
exports.AbstractOverlayAnchor = AbstractOverlayAnchor;
var AbstractOverlayAnchor3d = (function () {
    function AbstractOverlayAnchor3d(meshModel, meshView, overlayAnchor) {
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
    AbstractOverlayAnchor3d.prototype.update = function () {
        this.updatePosition();
    };
    AbstractOverlayAnchor3d.prototype.renderSprites = function () {
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
    return AbstractOverlayAnchor3d;
}());
exports.AbstractOverlayAnchor3d = AbstractOverlayAnchor3d;
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
