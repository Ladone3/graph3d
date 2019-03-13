Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
var keyHandler_1 = require("../input/keyHandler");
var VrViewController = (function (_super) {
    tslib_1.__extends(VrViewController, _super);
    function VrViewController(core, mouseHandler, keyHandler, gamepadHandler) {
        var _this = _super.call(this) || this;
        _this.core = core;
        _this.mouseHandler = mouseHandler;
        _this.keyHandler = keyHandler;
        _this.gamepadHandler = gamepadHandler;
        _this.id = 'vr-view-controller';
        _this.label = 'VR View Controller';
        _this.onKeyPressed = function (e) {
            if (e.data.has(keyHandler_1.KEY_CODES.ESCAPE)) {
                _this.switchOff();
            }
        };
        _this.onPresentingChanged = function () {
            if (!_this.vrManager.isConnected) {
                _this.switchOff();
            }
        };
        _this.vrManager = _this.core.vrManager;
        return _this;
    }
    VrViewController.prototype.focusOn = function () { };
    VrViewController.prototype.switchOn = function () {
        var _this = this;
        this.vrManager.connect().catch(function (e) {
            console.error(e.message + e.stack);
            _this.switchOff();
        });
        this.keyHandler.on('keyPressed', this.onKeyPressed);
        this.vrManager.on('connection:state:changed', this.onPresentingChanged);
        this.trigger('switched:on');
    };
    VrViewController.prototype.switchOff = function () {
        this.keyHandler.unsubscribe('keyPressed', this.onKeyPressed);
        this.vrManager.unsubscribe('connection:state:changed', this.onPresentingChanged);
        this.trigger('switched:off');
        this.vrManager.disconnect();
        this.core.forceRender();
    };
    return VrViewController;
}(utils_1.Subscribable));
exports.VrViewController = VrViewController;
