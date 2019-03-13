"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 * @author yomotsu / https://yomotsu.net/
 */
var CSS3DObject = /** @class */ (function (_super) {
    tslib_1.__extends(CSS3DObject, _super);
    function CSS3DObject(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        element.style.position = 'absolute';
        _this.addEventListener('removed', function () {
            if (element.parentNode !== null) {
                element.parentNode.removeChild(element);
            }
        });
        return _this;
    }
    return CSS3DObject;
}(THREE.Object3D));
exports.CSS3DObject = CSS3DObject;
var CSS3DSprite = /** @class */ (function (_super) {
    tslib_1.__extends(CSS3DSprite, _super);
    function CSS3DSprite(element) {
        var _this = _super.call(this, element) || this;
        _this.element = element;
        return _this;
    }
    return CSS3DSprite;
}(CSS3DObject));
exports.CSS3DSprite = CSS3DSprite;
var CSS3DRenderer = /** @class */ (function () {
    function CSS3DRenderer() {
        this.matrix = new THREE.Matrix4();
        this.cache = {
            camera: { fov: 0, style: '' },
            objects: new WeakMap(),
        };
        // tslint:disable-next-line: no-console
        console.log('THREE.CSS3DRenderer', THREE.REVISION);
        this.domElement = document.createElement('div');
        this.domElement.style.overflow = 'hidden';
        this.cameraElement = document.createElement('div');
        this.cameraElement.style.WebkitTransformStyle = 'preserve-3d';
        this.cameraElement.style.transformStyle = 'preserve-3d';
        this.domElement.appendChild(this.cameraElement);
        this.isIE = /Trident/i.test(navigator.userAgent);
    }
    CSS3DRenderer.prototype.getSize = function () {
        return {
            width: this._width,
            height: this._height,
        };
    };
    CSS3DRenderer.prototype.setSize = function (width, height) {
        this._width = width;
        this._height = height;
        this._widthHalf = this._width / 2;
        this._heightHalf = this._height / 2;
        this.domElement.style.width = width + 'px';
        this.domElement.style.height = height + 'px';
        this.cameraElement.style.width = width + 'px';
        this.cameraElement.style.height = height + 'px';
    };
    CSS3DRenderer.prototype.getObjectCSSMatrix = function (matrix, cameraCSSMatrix) {
        var elements = matrix.elements;
        var matrix3d = 'matrix3d(' +
            epsilon(elements[0]) + ',' +
            epsilon(elements[1]) + ',' +
            epsilon(elements[2]) + ',' +
            epsilon(elements[3]) + ',' +
            epsilon(-elements[4]) + ',' +
            epsilon(-elements[5]) + ',' +
            epsilon(-elements[6]) + ',' +
            epsilon(-elements[7]) + ',' +
            epsilon(elements[8]) + ',' +
            epsilon(elements[9]) + ',' +
            epsilon(elements[10]) + ',' +
            epsilon(elements[11]) + ',' +
            epsilon(elements[12]) + ',' +
            epsilon(elements[13]) + ',' +
            epsilon(elements[14]) + ',' +
            epsilon(elements[15]) +
            ')';
        if (this.isIE) {
            return 'translate(-50%,-50%)' +
                'translate(' + this._widthHalf + 'px,' + this._heightHalf + 'px)' +
                cameraCSSMatrix +
                matrix3d;
        }
        return 'translate(-50%,-50%)' + matrix3d;
    };
    CSS3DRenderer.prototype.renderObject = function (object, camera, cameraCSSMatrix) {
        if (object instanceof CSS3DObject) {
            var style = void 0;
            if (object instanceof CSS3DSprite) {
                this.matrix.copy(camera.matrixWorldInverse);
                this.matrix.transpose();
                this.matrix.copyPosition(object.matrixWorld);
                this.matrix.scale(object.scale);
                this.matrix.elements[3] = 0;
                this.matrix.elements[7] = 0;
                this.matrix.elements[11] = 0;
                this.matrix.elements[15] = 1;
                style = this.getObjectCSSMatrix(this.matrix, cameraCSSMatrix);
            }
            else {
                style = this.getObjectCSSMatrix(object.matrixWorld, cameraCSSMatrix);
            }
            var element = object.element;
            var cachedStyle = this.cache.objects.get(object);
            if (cachedStyle === undefined || cachedStyle !== style) {
                element.style.WebkitTransform = style;
                element.style.transform = style;
                var objectData = { style: style, distanceToCameraSquared: 0 };
                if (this.isIE) {
                    objectData.distanceToCameraSquared = getDistanceToSquared(camera, object);
                }
                this.cache.objects.set(object, objectData);
            }
            if (element.parentNode !== this.cameraElement) {
                this.cameraElement.appendChild(element);
            }
        }
        for (var i = 0, l = object.children.length; i < l; i++) {
            this.renderObject(object.children[i], camera, cameraCSSMatrix);
        }
    };
    CSS3DRenderer.prototype.zOrder = function (scene) {
        var _this = this;
        var sorted = filterAndFlatten(scene).sort(function (a, b) {
            var distanceA = _this.cache.objects.get(a).distanceToCameraSquared;
            var distanceB = _this.cache.objects.get(b).distanceToCameraSquared;
            return distanceA - distanceB;
        });
        var zMax = sorted.length;
        for (var i = 0, l = sorted.length; i < l; i++) {
            sorted[i].element.style.zIndex = "" + (zMax - i);
        }
    };
    CSS3DRenderer.prototype.render = function (scene, camera) {
        var fov = camera.projectionMatrix.elements[5] * this._heightHalf;
        if (this.cache.camera.fov !== fov) {
            if (camera.isPerspectiveCamera) {
                this.domElement.style.WebkitPerspective = fov + 'px';
                this.domElement.style.perspective = fov + 'px';
            }
            this.cache.camera.fov = fov;
        }
        scene.updateMatrixWorld();
        if (camera.parent === null) {
            camera.updateMatrixWorld();
        }
        var cameraCSSMatrix = camera.isOrthographicCamera ?
            "scale(" + fov + ")" + getCameraCSSMatrix(camera.matrixWorldInverse) :
            "translateZ(" + fov + "px)" + getCameraCSSMatrix(camera.matrixWorldInverse);
        var style = cameraCSSMatrix +
            ("translate(" + this._widthHalf + "px," + this._heightHalf + "px)");
        if (this.cache.camera.style !== style && !this.isIE) {
            this.cameraElement.style.WebkitTransform = style;
            this.cameraElement.style.transform = style;
            this.cache.camera.style = style;
        }
        this.renderObject(scene, camera, cameraCSSMatrix);
        if (this.isIE) {
            // IE10 and 11 does not support 'preserve-3d'.
            // Thus, z-order in 3D will not work.
            // We have to calc z-order manually and set CSS z-index for IE.
            // FYI: z-index can't handle object intersection
            this.zOrder(scene);
        }
    };
    return CSS3DRenderer;
}());
exports.CSS3DRenderer = CSS3DRenderer;
function filterAndFlatten(scene) {
    var result = [];
    scene.traverse(function (object) {
        if (object instanceof CSS3DObject) {
            result.push(object);
        }
    });
    return result;
}
function getDistanceToSquared(object1, object2) {
    var a = new THREE.Vector3();
    var b = new THREE.Vector3();
    a.setFromMatrixPosition(object1.matrixWorld);
    b.setFromMatrixPosition(object2.matrixWorld);
    return a.distanceToSquared(b);
}
function epsilon(value) {
    return Math.abs(value) < 1e-10 ? 0 : value;
}
function getCameraCSSMatrix(matrix) {
    var elements = matrix.elements;
    return 'matrix3d(' +
        epsilon(elements[0]) + ',' +
        epsilon(-elements[1]) + ',' +
        epsilon(elements[2]) + ',' +
        epsilon(elements[3]) + ',' +
        epsilon(elements[4]) + ',' +
        epsilon(-elements[5]) + ',' +
        epsilon(elements[6]) + ',' +
        epsilon(elements[7]) + ',' +
        epsilon(elements[8]) + ',' +
        epsilon(-elements[9]) + ',' +
        epsilon(elements[10]) + ',' +
        epsilon(elements[11]) + ',' +
        epsilon(elements[12]) + ',' +
        epsilon(-elements[13]) + ',' +
        epsilon(elements[14]) + ',' +
        epsilon(elements[15]) +
        ')';
}
