"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribable_1 = require("../utils/subscribable");
var webVr_1 = require("./webVr");
var VR_UNSUPPORTED_ERROR = 'Vr mode is not supported!';
var VrManager = /** @class */ (function (_super) {
    tslib_1.__extends(VrManager, _super);
    function VrManager(view) {
        var _this = _super.call(this) || this;
        _this.view = view;
        _this.animationLoop = function () {
            _this.view.renderer.render(_this.view.scene, _this.view.camera);
        };
        _this.connectionPromise = _this._connect();
        _this.listenToEvents();
        return _this;
    }
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
    VrManager.prototype.connect = function () {
        var _this = this;
        if (this.isConnected) {
            return Promise.resolve();
        }
        else {
            if (!this.connectionPromise) {
                this.connectionPromise = this._connect();
            }
            return this.connectionPromise.then(function (rMode) {
                _this.connectionPromise = null;
                if (rMode.type === 'xr') {
                    var sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };
                    return navigator.xr.requestSession('immersive-vr', sessionInit).then(function (session) {
                        _this.session = session;
                        return;
                    });
                }
                else if (rMode.type === 'vr') {
                    _this.device = rMode.device;
                    return;
                }
                else {
                    throw rMode.error;
                }
            });
        }
    };
    VrManager.prototype.getController = function (id) {
        return this.view.renderer.vr.getController(id);
    };
    VrManager.prototype.start = function () {
        var _this = this;
        if (this.isStarted) {
            return;
        }
        this.view.renderer.vr.enabled = true;
        this.view.renderer.setAnimationLoop(this.animationLoop);
        var vr = this.view.renderer.vr;
        vr.setFramebufferScaleFactor(0.8);
        if (this.session) {
            var onSessionEnded_1 = function (event) {
                _this.session.removeEventListener('end', onSessionEnded_1);
                vr.setSession(null);
                _this.session = null;
            };
            this.session.addEventListener('end', onSessionEnded_1);
            vr.setSession(this.session);
        }
        else {
            this.device.requestPresent([{ source: this.view.renderer.domElement }]);
        }
        this._isStarted = true;
    };
    VrManager.prototype.stop = function () {
        if (!this.isStarted) {
            return;
        }
        if (this.session) {
            this.session.end();
        }
        else {
            this.device.exitPresent();
        }
    };
    VrManager.prototype._connect = function () {
        if (webVr_1.isXrNavigator(navigator)) {
            return navigator.xr.isSessionSupported('immersive-vr')
                .then(function (supported) {
                if (supported) {
                    return { type: 'xr' };
                }
                else {
                    return { type: 'unsupported', error: new Error(VR_UNSUPPORTED_ERROR) };
                }
            });
        }
        else if (webVr_1.hasVrDisplays(navigator)) {
            return new Promise(function (resolve, reject) {
                navigator.getVRDisplays().then(function (displays) {
                    if (displays.length > 0) {
                        resolve({ type: 'vr', device: displays[0] });
                    }
                    else {
                        resolve({ type: 'unsupported', error: new Error(VR_UNSUPPORTED_ERROR + ". No VR displays.") });
                    }
                }).catch(function (e) { return ({ type: 'unsupported', error: e }); });
            });
        }
        else {
            return Promise.resolve({
                type: 'unsupported',
                error: new Error(VR_UNSUPPORTED_ERROR + ". Neither xr no VR modes are supported by navigator."),
            });
        }
    };
    VrManager.prototype.listenToEvents = function () {
        var _this = this;
        if (webVr_1.hasVrDisplays(navigator)) {
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
        }
    };
    VrManager.prototype._cancelVr = function () {
        // this.view.renderer.xr.enabled = false;
        this.view.renderer.vr.enabled = false;
        this.view.renderer.setAnimationLoop(this.animationLoop);
    };
    VrManager.prototype.setDevice = function (device) {
        this.device = device;
        this.view.renderer.vr.setDevice(this.device);
        this.trigger('connection:state:changed');
    };
    return VrManager;
}(subscribable_1.default));
exports.VrManager = VrManager;
