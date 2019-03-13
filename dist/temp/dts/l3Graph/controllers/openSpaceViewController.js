Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var viewController_1 = require("./viewController");
var utils_1 = require("../utils");
var keyHandler_1 = require("../input/keyHandler");
var OpenSpaceViewController = (function (_super) {
    tslib_1.__extends(OpenSpaceViewController, _super);
    function OpenSpaceViewController(view, mouseHandler, keyHandler) {
        var _this = _super.call(this) || this;
        _this.view = view;
        _this.mouseHandler = mouseHandler;
        _this.keyHandler = keyHandler;
        _this.cameraAngle = { x: 0, y: 0 };
        _this.position = { x: 1000, y: 0, z: 0 };
        _this.onMouseDragStart = function (event) {
            _this.startAngle = _this.cameraAngle;
        };
        _this.onMouseDrag = function (event) {
            var offset = event.data.offset;
            _this.setCameraDirection({
                x: _this.startAngle.x + offset.x / viewController_1.ROTATION_DECREASE_SPEED,
                y: _this.startAngle.y - offset.y / viewController_1.ROTATION_DECREASE_SPEED,
            });
        };
        _this.onMouseWheel = function (event) {
            var mouseEvent = event.data;
            var delta = mouseEvent.deltaY || mouseEvent.deltaX || mouseEvent.deltaZ;
            if (delta > 0) {
                _this.stepForward();
            }
            else {
                _this.stepBack();
            }
        };
        _this.onKeyPressed = function (event) {
            var keyMap = event.data;
            if (keyMap.has(keyHandler_1.KEY_CODES.LEFT) && !keyMap.has(keyHandler_1.KEY_CODES.RIGHT)) {
                _this.stepLeft();
            }
            else if (keyMap.has(keyHandler_1.KEY_CODES.RIGHT) && !keyMap.has(keyHandler_1.KEY_CODES.LEFT)) {
                _this.stepRight();
            }
            if (keyMap.has(keyHandler_1.KEY_CODES.DOWN) && !keyMap.has(keyHandler_1.KEY_CODES.UP)) {
                _this.stepBack();
            }
            else if (keyMap.has(keyHandler_1.KEY_CODES.UP) && !keyMap.has(keyHandler_1.KEY_CODES.DOWN)) {
                _this.stepForward();
            }
            if (keyMap.has(keyHandler_1.KEY_CODES.SPACE) && !keyMap.has(keyHandler_1.KEY_CODES.CTRL)) {
                _this.stepUp();
            }
            else if (keyMap.has(keyHandler_1.KEY_CODES.CTRL) && !keyMap.has(keyHandler_1.KEY_CODES.SPACE)) {
                _this.stepDown();
            }
        };
        _this.id = 'open-space-view-controller';
        _this.label = 'Open Space View Controller';
        _this.updateCameraPosition();
        return _this;
    }
    OpenSpaceViewController.prototype.switchOn = function () {
        this.keyHandler.on('keyPressed', this.onKeyPressed);
        this.mouseHandler.on('paperStartDrag', this.onMouseDragStart);
        this.mouseHandler.on('paperDrag', this.onMouseDrag);
        this.mouseHandler.on('paperScroll', this.onMouseWheel);
        this.refreshCamera();
        this.trigger('switched:on');
    };
    OpenSpaceViewController.prototype.switchOff = function () {
        this.keyHandler.unsubscribe('keyPressed', this.onKeyPressed);
        this.mouseHandler.unsubscribe('paperStartDrag', this.onMouseDragStart);
        this.mouseHandler.unsubscribe('paperDrag', this.onMouseDrag);
        this.mouseHandler.unsubscribe('paperScroll', this.onMouseWheel);
        this.trigger('switched:off');
    };
    OpenSpaceViewController.prototype.focusOn = function (element) {
    };
    OpenSpaceViewController.prototype.refreshCamera = function () {
        var position = this.view.cameraState.position;
        this.position = position;
        var curTreePos = utils_1.vector3dToTreeVector3(position);
        var distance = curTreePos.distanceTo(viewController_1.ZERO_POSITION);
        var y = -Math.asin(position.y / distance);
        var viewDir = utils_1.normalize(utils_1.inverse(curTreePos));
        var x = Math.atan2(viewDir.z, viewDir.x);
        this.cameraAngle = { x: x, y: y };
        this.updateCameraPosition();
    };
    OpenSpaceViewController.prototype.setCameraDirection = function (anglePoint) {
        this.cameraAngle = {
            x: anglePoint.x % (Math.PI * 2),
            y: Math.max(-Math.PI / 2 + 0.001, Math.min(anglePoint.y, Math.PI / 2 - 0.001)),
        };
        this.updateCameraPosition();
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
        var maxRadius = this.view.screenParameters.FAR / 2 - viewController_1.BORDER_OPACITY;
        var curTreePos = utils_1.vector3dToTreeVector3(targetPosition);
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
    OpenSpaceViewController.prototype.getCameraDirection = function () {
        return utils_1.normalize({
            x: Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
            y: Math.sin(this.cameraAngle.y),
            z: Math.sin(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
        });
    };
    return OpenSpaceViewController;
}(utils_1.Subscribable));
exports.OpenSpaceViewController = OpenSpaceViewController;
