Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribable_1 = require("../utils/subscribable");
var webVr_1 = require("./webVr");
var VrManager = (function (_super) {
    tslib_1.__extends(VrManager, _super);
    function VrManager(core) {
        var _this = _super.call(this) || this;
        _this.core = core;
        return _this;
    }
    Object.defineProperty(VrManager.prototype, "camera", {
        get: function () {
            return this.core.renderer.xr.getCamera(this.core.camera);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VrManager.prototype, "isConnected", {
        get: function () {
            return this._isConnected;
        },
        enumerable: true,
        configurable: true
    });
    VrManager.prototype.disconnect = function () {
        if (this._session) {
            this._session.end();
        }
    };
    VrManager.prototype.connect = function () {
        var _this = this;
        return this.checkIfSupported().then(function (supported) {
            return new Promise(function (resolve, reject) {
                if (supported) {
                    var sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] };
                    return navigator.xr.requestSession('immersive-vr', sessionInit).then(function (session) {
                        var xr = _this.core.renderer.xr;
                        var onSessionEnded = function (event) {
                            session.removeEventListener('end', onSessionEnded);
                            _this._isConnected = false;
                            resolve();
                            _this.trigger('connection:state:changed');
                        };
                        session.addEventListener('end', onSessionEnded);
                        xr.setSession(session);
                        _this._session = session;
                        _this._isConnected = true;
                        _this.trigger('connection:state:changed');
                    });
                }
                else {
                    reject(new Error('Vr mode is not supported! Neither xr no VR modes are supported by navigator.'));
                }
            });
        });
    };
    VrManager.prototype.getController = function (id) {
        return this.core.renderer.xr.getController(id);
    };
    VrManager.prototype.checkIfSupported = function () {
        if (webVr_1.isXrNavigator(navigator)) {
            return navigator.xr.isSessionSupported('immersive-vr');
        }
        else {
            return Promise.resolve(false);
        }
    };
    return VrManager;
}(subscribable_1.default));
exports.VrManager = VrManager;
