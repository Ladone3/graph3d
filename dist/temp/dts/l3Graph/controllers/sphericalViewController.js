"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var viewController_1 = require("./viewController");
var utils_1 = require("../utils");
var WHEEL_SPEED = 100;
var SphericalViewController = /** @class */ (function (_super) {
    tslib_1.__extends(SphericalViewController, _super);
    function SphericalViewController(view, mouseHandler, keyHandler) {
        var _this = _super.call(this) || this;
        _this.view = view;
        _this.mouseHandler = mouseHandler;
        _this.keyHandler = keyHandler;
        _this.cameraAngle = { x: 0, y: Math.PI / 4 };
        _this.cameraDistance = 1000;
        _this.onMouseDragStart = function (event) {
            _this.startAngle = _this.cameraAngle;
        };
        _this.onMouseDrag = function (event) {
            var offset = event.data.offset;
            _this.setCameraAngle({
                x: _this.startAngle.x + offset.x / viewController_1.ROTATION_DECREASE_SPEED,
                y: _this.startAngle.y + offset.y / (viewController_1.ROTATION_DECREASE_SPEED * 3),
            });
        };
        _this.onMouseWheel = function (event) {
            var wheelEvent = event.data;
            var delta = wheelEvent.deltaY || wheelEvent.deltaX || wheelEvent.deltaZ;
            var deltaNorma = delta < 0 ? 1 : -1;
            _this.zoom(deltaNorma * WHEEL_SPEED);
        };
        _this.onKeyPressed = function (event) {
            var keyMap = event.data;
            var currentAngle = _this.cameraAngle;
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
                _this.zoom(-10);
            }
            else if (keyMap.has(utils_1.KEY_CODES.PLUS) && !keyMap.has(utils_1.KEY_CODES.MINUS)) {
                _this.zoom(10);
            }
            _this.setCameraAngle({
                x: currentAngle.x + x / viewController_1.KEY_ROTATION_DECREASE_SPEED,
                y: currentAngle.y + y / (viewController_1.KEY_ROTATION_DECREASE_SPEED * 3),
            });
        };
        _this.id = 'spherical-view-controller';
        _this.label = 'Spherical View Controller';
        _this.updateCameraPosition();
        return _this;
    }
    SphericalViewController.prototype.switchOn = function () {
        this.keyHandler.on('keyPressed', this.onKeyPressed);
        this.mouseHandler.on('paperStartDrag', this.onMouseDragStart);
        this.mouseHandler.on('paperDrag', this.onMouseDrag);
        this.mouseHandler.on('paperScroll', this.onMouseWheel);
        this.refreshCamera();
        this.trigger('switched:on');
    };
    SphericalViewController.prototype.switchOff = function () {
        this.keyHandler.unsubscribe('keyPressed', this.onKeyPressed);
        this.mouseHandler.unsubscribe('paperStartDrag', this.onMouseDragStart);
        this.mouseHandler.unsubscribe('paperDrag', this.onMouseDrag);
        this.mouseHandler.unsubscribe('paperScroll', this.onMouseWheel);
        this.trigger('switched:off');
    };
    SphericalViewController.prototype.refreshCamera = function () {
        var position = this.view.cameraState.position;
        var curTreePos = utils_1.vector3dToTreeVector3(position);
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
        return Math.min(Math.max(0.001, distance), this.view.screenParameters.FAR / 2 - viewController_1.BORDER_OPACITY);
    };
    SphericalViewController.prototype.zoom = function (diff) {
        var curDistance = this.cameraDistance;
        this.setCameraDistance(curDistance - diff * viewController_1.ZOOM_STEP_MULTIPLAYER);
    };
    return SphericalViewController;
}(utils_1.Subscribable));
exports.SphericalViewController = SphericalViewController;
