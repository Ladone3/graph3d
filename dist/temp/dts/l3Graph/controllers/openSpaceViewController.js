"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viewController_1 = require("./viewController");
var utils_1 = require("../utils");
var _ = require("lodash");
var OpenSpaceViewController = /** @class */ (function () {
    function OpenSpaceViewController(view) {
        this.cameraAngle = { x: 0, y: 0 };
        this.position = { x: 1000, y: 0, z: 0 };
        this.view = view;
        this.id = _.uniqueId('view-controller-');
        this.label = 'Open Space View Controller';
        this.updateCameraPosition();
    }
    OpenSpaceViewController.prototype.onMouseDown = function (event) {
        var _this = this;
        var startAngle = this.cameraAngle;
        utils_1.handleDragging(event, function (dragEvent, offset) {
            _this.setCameraDirection({
                x: startAngle.x + offset.x / viewController_1.ROTATION_DECREASE_SPEED,
                y: startAngle.y - offset.y / viewController_1.ROTATION_DECREASE_SPEED,
            });
        });
    };
    OpenSpaceViewController.prototype.setCameraDirection = function (anglePoint) {
        this.cameraAngle = {
            x: anglePoint.x % (Math.PI * 2),
            y: Math.max(-Math.PI / 2 + 0.001, Math.min(anglePoint.y, Math.PI / 2 - 0.001)),
        };
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.onKeyPressed = function (keyMap) {
        if (keyMap.has(utils_1.KEY_CODES.LEFT) && !keyMap.has(utils_1.KEY_CODES.RIGHT)) {
            this.stepLeft();
        }
        else if (keyMap.has(utils_1.KEY_CODES.RIGHT) && !keyMap.has(utils_1.KEY_CODES.LEFT)) {
            this.stepRight();
        }
        if (keyMap.has(utils_1.KEY_CODES.DOWN) && !keyMap.has(utils_1.KEY_CODES.UP)) {
            this.stepBack();
        }
        else if (keyMap.has(utils_1.KEY_CODES.UP) && !keyMap.has(utils_1.KEY_CODES.DOWN)) {
            this.stepForward();
        }
        if (keyMap.has(utils_1.KEY_CODES.SPACE) && !keyMap.has(utils_1.KEY_CODES.CTRL)) {
            this.stepUp();
        }
        else if (keyMap.has(utils_1.KEY_CODES.CTRL) && !keyMap.has(utils_1.KEY_CODES.SPACE)) {
            this.stepDown();
        }
    };
    OpenSpaceViewController.prototype.onMouseWheel = function (event) {
        var delta = event.deltaY || event.deltaX || event.deltaZ;
        if (delta > 0) {
            this.stepForward();
        }
        else {
            this.stepBack();
        }
    };
    OpenSpaceViewController.prototype.stepLeft = function () {
        var cameraDirection = this.getCameraDirection();
        var dir = utils_1.normalLeft(cameraDirection);
        var newPos = utils_1.sum(this.position, utils_1.multiply(dir, viewController_1.CAMERA_STEP_SPEED));
        this.position = this.limitPosition(newPos);
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.stepRight = function () {
        var cameraDirection = this.getCameraDirection();
        var dir = utils_1.normalRight(cameraDirection);
        var newPos = utils_1.sum(this.position, utils_1.multiply(dir, viewController_1.CAMERA_STEP_SPEED));
        this.position = this.limitPosition(newPos);
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.stepUp = function () {
        var cameraDirection = this.getCameraDirection();
        var dir = utils_1.normalUp(cameraDirection);
        var newPos = utils_1.sum(this.position, utils_1.multiply(dir, viewController_1.CAMERA_STEP_SPEED));
        this.position = this.limitPosition(newPos);
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.stepDown = function () {
        var cameraDirection = this.getCameraDirection();
        var dir = utils_1.normalDown(cameraDirection);
        var newPos = utils_1.sum(this.position, utils_1.multiply(dir, viewController_1.CAMERA_STEP_SPEED));
        this.position = this.limitPosition(newPos);
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.stepForward = function () {
        var cameraDirection = this.getCameraDirection();
        this.position = this.limitPosition({
            x: this.position.x - cameraDirection.x * viewController_1.CAMERA_STEP_SPEED,
            y: this.position.y - cameraDirection.y * viewController_1.CAMERA_STEP_SPEED,
            z: this.position.z - cameraDirection.z * viewController_1.CAMERA_STEP_SPEED,
        });
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.stepBack = function () {
        var cameraDirection = this.getCameraDirection();
        this.position = this.limitPosition({
            x: this.position.x + cameraDirection.x * viewController_1.CAMERA_STEP_SPEED,
            y: this.position.y + cameraDirection.y * viewController_1.CAMERA_STEP_SPEED,
            z: this.position.z + cameraDirection.z * viewController_1.CAMERA_STEP_SPEED,
        });
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.focusOn = function (element) {
        // not implemented
    };
    OpenSpaceViewController.prototype.refreshCamera = function () {
        var position = this.view.cameraState.position;
        this.position = position;
        var curTreePos = utils_1.vector3DToTreeVector3(position);
        var distance = curTreePos.distanceTo(viewController_1.ZERO_POSITION);
        var y = -Math.asin(position.y / distance);
        var viewDir = utils_1.normalize(utils_1.inverse(curTreePos));
        var x = Math.atan2(viewDir.z, viewDir.x);
        // const y = Math.atan2(x, viewDir.y) + Math.PI / 2;
        this.cameraAngle = { x: x, y: y };
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.getCameraDirection = function () {
        return utils_1.normalize({
            x: Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
            y: Math.sin(this.cameraAngle.y),
            z: Math.sin(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
        });
    };
    OpenSpaceViewController.prototype.updateCameraPosition = function () {
        var cameraDirection = this.getCameraDirection();
        var focusDirection = {
            x: this.position.x + cameraDirection.x,
            y: this.position.y + cameraDirection.y,
            z: this.position.z + cameraDirection.z,
        };
        this.view.cameraState = {
            position: this.position,
            focusDirection: focusDirection,
        };
    };
    OpenSpaceViewController.prototype.limitPosition = function (targetPosition) {
        var maxRadius = this.view.screenParameters.FAR / 2 - viewController_1.LIMIT_OPACITY;
        var curTreePos = utils_1.vector3DToTreeVector3(targetPosition);
        var distanceToTheCenter = curTreePos.distanceTo(viewController_1.ZERO_POSITION);
        if (distanceToTheCenter > maxRadius) {
            var directionFromTheCenter = utils_1.normalize(targetPosition);
            var directionToTheCenter = utils_1.inverse(directionFromTheCenter);
            var diffDirection = utils_1.multiply(directionToTheCenter, distanceToTheCenter - maxRadius);
            return utils_1.sum(targetPosition, diffDirection);
        }
        else {
            return targetPosition;
        }
    };
    return OpenSpaceViewController;
}());
exports.OpenSpaceViewController = OpenSpaceViewController;
