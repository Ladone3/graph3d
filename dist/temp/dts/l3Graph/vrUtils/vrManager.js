"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribeable_1 = require("../utils/subscribeable");
var webVr_1 = require("./webVr");
var VrManager = /** @class */ (function (_super) {
    tslib_1.__extends(VrManager, _super);
    function VrManager(view) {
        var _this = _super.call(this) || this;
        _this.view = view;
        _this.errorMessages = [];
        _this.animationLoop = function () {
            _this.view.renderer.render(_this.view.scene, _this.view.camera);
        };
        return _this;
    }
    Object.defineProperty(VrManager.prototype, "errors", {
        get: function () {
            return this.errorMessages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VrManager.prototype, "isStarted", {
        get: function () {
            return this._isStarted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VrManager.prototype, "isConnected", {
        get: function () {
            return Boolean(this.device);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VrManager.prototype, "camera", {
        get: function () {
            return this.view.renderer.vr.getCamera(this.view.camera);
        },
        enumerable: true,
        configurable: true
    });
    VrManager.prototype.getController = function (id) {
        return this.view.renderer.vr.getController(id);
    };
    VrManager.prototype.start = function () {
        var _this = this;
        if (this.isStarted) {
            return;
        }
        this._initVr();
        // var vrControls = new THREE.VR(this.view.camera);
        var vr = this.view.renderer.vr;
        vr.setFramebufferScaleFactor(0.8);
        if (this.isXr) {
            var onSessionStarted = function (session) {
                _this.session.addEventListener('end', onSessionEnded_1);
                vr.setSession(session);
            };
            var onSessionEnded_1 = function (event) {
                _this.session.removeEventListener('end', onSessionEnded_1);
                vr.setSession(null);
                _this.session = null;
            };
            this.device.requestSession({ immersive: true, exclusive: true }).then(onSessionStarted);
        }
        else {
            this.device.requestPresent([{ source: this.view.renderer.domElement }]);
        }
        this._isStarted = true;
    };
    VrManager.prototype.stop = function () {
        if (!this.isStarted)
            return;
        if (this.isXr) {
            this.session.end();
        }
        else {
            this.device.exitPresent();
        }
    };
    VrManager.prototype.connect = function () {
        var _this = this;
        var promise;
        if (webVr_1.isXrNavigator(navigator)) {
            promise = navigator.xr.requestDevice().then(function (device) {
                device.supportsSession({ immersive: true, exclusive: true })
                    .then(function () { _this.setDevice(device); })
                    .catch(function (e) {
                    _this.setDevice(null);
                    _this.setError("Session is not support this mode: " + e.errorMessage + ".");
                });
            }).catch(function (e) { return _this.setError("Error during requesting device: " + e.errorMessage + "."); });
            this.isXr = true;
        }
        else if ('getVRDisplays' in navigator) {
            promise = navigator.getVRDisplays()
                .then(function (displays) {
                if (displays.length > 0) {
                    _this.setDevice(displays[0]);
                }
                else {
                    _this.setDevice(null);
                    _this.setError("VR display is not found yet.");
                }
            }).catch(function (e) {
                _this.setDevice(null);
                _this.setError("Error during requesting displays: " + e.errorMessage + ".");
            });
            this.isXr = false;
        }
        window.addEventListener('vrdisplayconnect', function (event) {
            _this.setDevice(event.display);
        }, false);
        window.addEventListener('vrdisplaydisconnect', function (event) {
            _this.stop();
            _this.setDevice(null);
        }, false);
        window.addEventListener('vrdisplayactivate', function (event) {
            _this.start();
        }, false);
        window.addEventListener('vrdisplaypresentchange', function (event) {
            var vrEvent = event;
            _this._isStarted = vrEvent.display.isPresenting;
            if (!_this._isStarted) {
                _this._cancelVr();
            }
            _this.trigger('presenting:state:changed');
        }, false);
        return promise;
    };
    VrManager.prototype._initVr = function () {
        this.view.renderer.vr.enabled = true;
        this.view.renderer.setAnimationLoop(this.animationLoop);
    };
    VrManager.prototype._cancelVr = function () {
        this.view.renderer.vr.enabled = false;
        this.view.renderer.setAnimationLoop(null);
    };
    VrManager.prototype.setError = function (message) {
        this.errorMessages.push(message);
    };
    VrManager.prototype.setDevice = function (device) {
        this.device = device;
        this.view.renderer.vr.setDevice(this.device);
        this.trigger('connection:state:changed');
    };
    return VrManager;
}(subscribeable_1.default));
exports.VrManager = VrManager;
