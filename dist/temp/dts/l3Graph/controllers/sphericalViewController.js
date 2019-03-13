"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viewController_1 = require("./viewController");
var utils_1 = require("../utils");
var _ = require("lodash");
var SphericalViewController = /** @class */ (function () {
    function SphericalViewController(view) {
        this.cameraAngle = { x: 0, y: Math.PI / 4 };
        this.cameraDistance = 1000;
        this.view = view;
        this.id = _.uniqueId('view-controller-');
        this.label = 'Spherical View Controller';
        this.updateCameraPosition();
    }
    SphericalViewController.prototype.onMouseDown = function (event) {
        var _this = this;
        var startAngle = this.cameraAngle;
        utils_1.handleDragging(event, function (dragEvent, offset) {
            _this.setCameraAngle({
                x: startAngle.x + offset.x / viewController_1.ROTATION_DECREASE_SPEED,
                y: startAngle.y + offset.y / (viewController_1.ROTATION_DECREASE_SPEED * 3),
            });
        });
    };
    SphericalViewController.prototype.onKeyPressed = function (keyMap) {
        var currentAngle = this.cameraAngle;
        var x = 0;
        var y = 0;
        if (keyMap.has(utils_1.KEY_CODES.LEFT) && !keyMap.has(utils_1.KEY_CODES.RIGHT)) {
            x = 1;
        }
        else if (keyMap.has(utils_1.KEY_CODES.RIGHT) && !keyMap.has(utils_1.KEY_CODES.LEFT)) {
            x = -1;
        }
        if (keyMap.has(utils_1.KEY_CODES.DOWN) && !keyMap.has(utils_1.KEY_CODES.UP)) {
            y = 1;
        }
        else if (keyMap.has(utils_1.KEY_CODES.UP) && !keyMap.has(utils_1.KEY_CODES.DOWN)) {
            y = -1;
        }
        if (keyMap.has(utils_1.KEY_CODES.MINUS) && !keyMap.has(utils_1.KEY_CODES.PLUS)) {
            this.zoom(-10);
        }
        else if (keyMap.has(utils_1.KEY_CODES.PLUS) && !keyMap.has(utils_1.KEY_CODES.MINUS)) {
            this.zoom(10);
        }
        this.setCameraAngle({
            x: currentAngle.x + x / viewController_1.KEY_ROTATION_DECREASE_SPEED,
            y: currentAngle.y + y / (viewController_1.KEY_ROTATION_DECREASE_SPEED * 3),
        });
    };
    SphericalViewController.prototype.onMouseWheel = function (event) {
        var delta = event.deltaY || event.deltaX || event.deltaZ;
        this.zoom(delta);
    };
    SphericalViewController.prototype.zoom = function (diff) {
        var curDistance = this.cameraDistance;
        this.setCameraDistance(curDistance + diff * viewController_1.ZOOM_STEP_MULTIPLAYER);
    };
    SphericalViewController.prototype.refreshCamera = function () {
        var position = this.view.cameraState.position;
        var curTreePos = utils_1.vector3DToTreeVector3(position);
        var distance = curTreePos.distanceTo(viewController_1.ZERO_POSITION);
        this.cameraDistance = this.limitDistance(distance);
        var y = Math.asin(position.y / this.cameraDistance);
        var x = Math.acos(position.x / (Math.cos(y) * this.cameraDistance));
        // Here is a hack, because I don't really like math.
        if (Math.round(position.x) !== Math.round(Math.cos(x) * this.cameraDistance * Math.cos(y)) ||
            Math.round(position.z) !== Math.round(Math.sin(x) * this.cameraDistance * Math.cos(y))) {
            x = Math.asin(position.z / (Math.cos(y) * this.cameraDistance));
        }
        this.cameraAngle = { x: x, y: y };
        this.updateCameraPosition();
    };
    SphericalViewController.prototype.focusOn = function (element) {
        // not implemented
    };
    SphericalViewController.prototype.setCameraAngle = function (anglePoint) {
        this.cameraAngle = {
            x: anglePoint.x % (Math.PI * 2),
            y: Math.max(-Math.PI / 2 + 0.001, Math.min(anglePoint.y, Math.PI / 2 - 0.001)),
        };
        this.updateCameraPosition();
    };
    SphericalViewController.prototype.setCameraDistance = function (distance) {
        this.cameraDistance = this.limitDistance(distance);
        this.updateCameraPosition();
    };
    SphericalViewController.prototype.updateCameraPosition = function () {
        var cameraPosition = {
            x: Math.cos(this.cameraAngle.x) * this.cameraDistance * Math.cos(this.cameraAngle.y),
            y: Math.sin(this.cameraAngle.y) * this.cameraDistance,
            z: Math.sin(this.cameraAngle.x) * this.cameraDistance * Math.cos(this.cameraAngle.y),
        };
        this.view.cameraState = {
            position: cameraPosition,
            focusDirection: this.view.scene.position,
        };
    };
    SphericalViewController.prototype.limitDistance = function (distance) {
        return Math.min(Math.max(0.001, distance), this.view.screenParameters.FAR / 2 - viewController_1.LIMIT_OPACITY);
    };
    return SphericalViewController;
}());
exports.SphericalViewController = SphericalViewController;
