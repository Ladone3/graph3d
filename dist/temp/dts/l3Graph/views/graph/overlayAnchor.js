"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var ReactDOM = require("react-dom");
var React = require("react");
var customisation_1 = require("../../customisation");
var utils_1 = require("../../utils");
// todo: verify again the functions list - not everything is clear here
var AbstractOverlayAnchor = /** @class */ (function (_super) {
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
        _this.sprite = new THREE.CSS3DSprite(_this.html);
        _this.overlaysByPosition = new Map();
        _this._overlayPositions = new Map();
        return _this;
    }
    Object.defineProperty(AbstractOverlayAnchor.prototype, "overlays", {
        get: function () {
            return this.overlaysByPosition;
        },
        enumerable: true,
        configurable: true
    });
    AbstractOverlayAnchor.prototype.hasOverlay = function (owelrayId) {
        return this._overlayPositions.has(owelrayId);
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
    AbstractOverlayAnchor.prototype.enrichOverlay = function (pooreOverlay) {
        return customisation_1.enrichOverlay(pooreOverlay, this.meshModel);
    };
    AbstractOverlayAnchor.prototype.redraw = function () {
        var _this = this;
        var OverlayedGroup = this.overlayedGroup;
        if (this.overlaysByPosition.size === 0) {
            ReactDOM.unmountComponentAtNode(this.html);
        }
        else {
            var overlayGroups_1 = [];
            this.overlaysByPosition.forEach(function (overlays, position) {
                var overlayViews = [];
                overlays.forEach(function (poorOverlay) {
                    overlayViews.push(React.createElement("div", { ref: (function (ref) { return _this._renderedOverlays.set(poorOverlay.id, ref); }) }, _this.renderOverlay(poorOverlay, position)));
                });
                overlayGroups_1.push(React.createElement(OverlayedGroup, { position: position }, overlayViews));
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
            var Context = customisation_1.createContextProvider(overlay.context);
            return (React.createElement(Context, { key: key }, overlay.value));
        }
        else {
            return overlay.value;
        }
    };
    return AbstractOverlayAnchor;
}(utils_1.Subscribable));
exports.AbstractOverlayAnchor = AbstractOverlayAnchor;
