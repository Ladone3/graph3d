"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var DEFAULT_SIZE = { x: 20, y: 20 };
var BORDER_WIDTH = 1;
var DISPLAY_SCALE = 10000;
var DEFAULT_DISPLAY_MATERIAL = new THREE.MeshLambertMaterial({ color: 'grey', side: THREE.DoubleSide });
var ImageMesh = /** @class */ (function (_super) {
    tslib_1.__extends(ImageMesh, _super);
    function ImageMesh(parameters) {
        if (parameters === void 0) { parameters = {}; }
        var _this = _super.call(this) || this;
        _this.image = parameters.image;
        _this.size = parameters.size || DEFAULT_SIZE;
        _this.borderPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), DEFAULT_DISPLAY_MATERIAL);
        _this.add(_this.borderPlane);
        _this.render();
        return _this;
    }
    ImageMesh.prototype.setImage = function (image) {
        this.image = image;
        this.render();
    };
    ImageMesh.prototype.setPreferredSize = function (size) {
        this.size = size || DEFAULT_SIZE;
        this.render();
    };
    ImageMesh.prototype.render = function () {
        if (this.plane) {
            this.remove(this.plane);
        }
        var plane;
        if (this.image) {
            var scalerX = this.size.x ? (this.size.x / this.image.width) * DISPLAY_SCALE : 1;
            var scalerY = this.size.y ? (this.size.y / this.image.height) * DISPLAY_SCALE : 1;
            var scaler = Math.min(scalerX, scalerY);
            var texture = new THREE.Texture(this.image);
            texture.anisotropy = 16;
            texture.needsUpdate = true;
            var actualSize = {
                width: this.image.width * scaler,
                height: this.image.height * scaler,
            };
            plane = new THREE.Mesh(new THREE.PlaneGeometry(actualSize.width, actualSize.height), new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }));
            plane.scale.setScalar(1 / DISPLAY_SCALE);
            plane.position.set(0, 0, 0);
            this.add(plane);
            this.plane = plane;
            this.borderPlane.scale.set(actualSize.width / DISPLAY_SCALE + BORDER_WIDTH, actualSize.height / DISPLAY_SCALE + BORDER_WIDTH, 1);
            this.borderPlane.position.set(0, 0, -0.05);
        }
        else {
            this.plane = undefined;
            this.borderPlane.scale.set(DEFAULT_SIZE.x, DEFAULT_SIZE.y, 1);
            this.borderPlane.position.set(0, 0, -0.05);
        }
    };
    return ImageMesh;
}(THREE.Group));
exports.ImageMesh = ImageMesh;
