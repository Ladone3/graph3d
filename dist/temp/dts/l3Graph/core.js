Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var CSS3DRenderer_1 = require("./utils/CSS3DRenderer");
var vrManager_1 = require("./vrUtils/vrManager");
var utils_1 = require("./utils");
exports.DEFAULT_CAMERA_DIST = 100;
exports.DEFAULT_SCREEN_PARAMETERS = {
    VIEW_ANGLE: 45,
    NEAR: 0.1,
    FAR: 10000,
};
var Cancellation = (function (_super) {
    tslib_1.__extends(Cancellation, _super);
    function Cancellation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isCancelled = false;
        return _this;
    }
    Cancellation.prototype.stop = function () {
        this.isCancelled = true;
        this.trigger('cancel');
    };
    return Cancellation;
}(utils_1.Subscribable));
exports.Cancellation = Cancellation;
var Core = (function () {
    function Core() {
        var _this = this;
        this.animationLoopActions = new Set();
        this.forceRenderFlag = false;
        this.forceRender = function () {
            _this.forceRenderFlag = true;
        };
        this.forceRenderAction = function () {
            if (_this.forceRenderFlag) {
                _this.forceRenderFlag = false;
                return true;
            }
            else {
                return false;
            }
        };
        this.vrAction = function () { return true; };
        this.vrManager = new vrManager_1.VrManager(this);
        this.vrManager.on('connection:state:changed', function () {
            if (_this.vrManager.isConnected) {
                _this.animationLoopActions.add(_this.vrAction);
            }
            else {
                _this.animationLoopActions.delete(_this.vrAction);
            }
        });
        this.animationLoopActions.add(this.forceRenderAction);
        this.initScene();
    }
    Core.prototype.addAnimationLoopAction = function (action) {
        this.animationLoopActions.add(action);
    };
    Core.prototype.removeAnimationLoopAction = function (action) {
        this.animationLoopActions.delete(action);
    };
    Core.prototype.animationFrameInterval = function (intervalCallback) {
        var _this = this;
        var cancellation = new Cancellation();
        var animate = function () {
            return cancellation.isCancelled ? false : intervalCallback() || false;
        };
        this.addAnimationLoopAction(animate);
        cancellation.on('cancel', function () {
            _this.removeAnimationLoopAction(animate);
        });
        return cancellation;
    };
    Core.prototype.attachTo = function (rootHTML, rootOverlayHtml) {
        this.rootHTML = rootHTML;
        this.rootHTML.appendChild(this.renderer.domElement);
        this.rootOverlayHtml = rootOverlayHtml;
        this.rootOverlayHtml.appendChild(this.overlayRenderer.domElement);
        this.resize();
    };
    Core.prototype.mouseTo3dPos = function (event, distanceFromScreen) {
        if (distanceFromScreen === void 0) { distanceFromScreen = 600; }
        var bBox = this.rootHTML ?
            this.rootHTML.getBoundingClientRect() : { x: 0, y: 0, width: 100, height: 100 };
        return this.clientPosTo3dPos(utils_1.eventToPosition(event, bBox) || { x: 0, y: 0 }, distanceFromScreen);
    };
    Core.prototype.clientPosTo3dPos = function (position, distanceFromScreen) {
        if (distanceFromScreen === void 0) { distanceFromScreen = 600; }
        var cameraPos = this.camera.position;
        var screenParameters = this.screenParameters;
        var vector = new THREE.Vector3((position.x / screenParameters.WIDTH) * 2 - 1, 1 - (position.y / screenParameters.HEIGHT) * 2, 1);
        var point = vector.unproject(this.camera);
        var distance = point.distanceTo(cameraPos);
        var k = distanceFromScreen / distance;
        var relativePoint = {
            x: point.x - cameraPos.x,
            y: point.y - cameraPos.y,
            z: point.z - cameraPos.z,
        };
        return {
            x: relativePoint.x * k + cameraPos.x,
            y: relativePoint.y * k + cameraPos.y,
            z: relativePoint.z * k + cameraPos.z,
        };
    };
    Core.prototype.pos3dToClientPos = function (position) {
        var treePos = utils_1.vector3dToTreeVector3(position);
        var screenParameters = this.screenParameters;
        var vector = treePos.project(this.camera);
        return {
            x: (vector.x + 1) * screenParameters.WIDTH / 2,
            y: (1 - vector.y) * screenParameters.HEIGHT / 2,
        };
    };
    Object.defineProperty(Core.prototype, "cameraState", {
        get: function () {
            var focusDirection = new THREE.Vector3(0, 0, -1);
            focusDirection.applyQuaternion(this.camera.quaternion);
            return {
                position: this.camera.position,
                focusDirection: focusDirection,
            };
        },
        enumerable: true,
        configurable: true
    });
    Core.prototype.setCameraState = function (cameraState) {
        var position = cameraState.position, focusDirection = cameraState.focusDirection;
        this.camera.position.x = position.x;
        this.camera.position.y = position.y;
        this.camera.position.z = position.z;
        if (focusDirection) {
            this.camera.lookAt(new THREE.Vector3(focusDirection.x, focusDirection.y, focusDirection.z));
        }
        this.forceRender();
    };
    Core.prototype.resize = function () {
        if (!this.rootHTML) {
            return;
        }
        this.screenParameters = tslib_1.__assign(tslib_1.__assign({}, this.screenParameters), { WIDTH: this.rootHTML.clientWidth, HEIGHT: this.rootHTML.clientHeight, ASPECT: this.rootHTML.clientWidth / this.rootHTML.clientHeight });
        this.renderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        this.overlayRenderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        this.camera.aspect = this.screenParameters.ASPECT;
        this.camera.updateProjectionMatrix();
        this.forceRender();
    };
    Core.prototype.initScene = function () {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(255, 255, 255);
        this.screenParameters = tslib_1.__assign(tslib_1.__assign({}, exports.DEFAULT_SCREEN_PARAMETERS), { WIDTH: 100, HEIGHT: 100, ASPECT: 1 });
        this.camera = new THREE.PerspectiveCamera(this.screenParameters.VIEW_ANGLE, this.screenParameters.ASPECT, this.screenParameters.NEAR, this.screenParameters.FAR);
        this.camera.position.set(0, 0, exports.DEFAULT_CAMERA_DIST);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);
        var dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(200, 200, 1000).normalize();
        this.scene.add(new THREE.AmbientLight(0x444444));
        this.camera.add(dirLight);
        this.camera.add(dirLight.target);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        this.renderer.setClearColor('white');
        this.renderer.xr.enabled = true;
        this.overlayRenderer = new CSS3DRenderer_1.CSS3DRenderer();
        this.overlayRenderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        var sphereGeometry = new THREE.SphereGeometry(this.screenParameters.FAR / 2, 35, 35);
        var sphereMaterial = new THREE.MeshBasicMaterial({
            wireframe: true, color: 0xf0f0f0,
        });
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(0, 0, 0);
        this.scene.add(sphere);
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
        this.setAnimationLoop();
    };
    Core.prototype.setAnimationLoop = function () {
        var _this = this;
        this.renderer.setAnimationLoop(function () {
            var renderNeeded = false;
            _this.animationLoopActions.forEach(function (action) {
                var askForRender = action();
                renderNeeded = renderNeeded || askForRender;
            });
            if (renderNeeded) {
                _this.renderer.render(_this.scene, _this.camera);
                _this.overlayRenderer.render(_this.scene, _this.camera);
            }
        });
    };
    return Core;
}());
exports.Core = Core;
