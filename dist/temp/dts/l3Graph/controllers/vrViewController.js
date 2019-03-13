"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
var VrViewController = /** @class */ (function (_super) {
    tslib_1.__extends(VrViewController, _super);
    function VrViewController(view, mouseHandler, keyHandler, gamepadHandler) {
        var _this = _super.call(this) || this;
        _this.view = view;
        _this.mouseHandler = mouseHandler;
        _this.keyHandler = keyHandler;
        _this.gamepadHandler = gamepadHandler;
        _this.id = 'vr-view-controller';
        _this.label = 'VR View Controller';
        _this.onKeyPressed = function (e) {
            if (e.data.has(utils_1.KEY_CODES.ESCAPE)) {
                _this.switchOff();
            }
        };
        _this.onPresentingChanged = function () {
            if (!_this.vrManager.isStarted) {
                _this.switchOff();
            }
        };
        _this.vrManager = _this.view.vrManager;
        _this.connectionPromise = _this.vrManager.connect();
        return _this;
    }
    VrViewController.prototype.focusOn = function () { };
    VrViewController.prototype.switchOn = function () {
        var _this = this;
        if (!this.vrManager.isConnected) {
            this.connectionPromise.then(function () {
                _this.vrManager.start();
                _this.view.renderGraph();
            });
        }
        else {
            this.vrManager.start();
            this.view.renderGraph();
        }
        this.keyHandler.on('keyPressed', this.onKeyPressed);
        this.vrManager.on('presenting:state:changed', this.onPresentingChanged);
        this.trigger('switched:on');
    };
    VrViewController.prototype.switchOff = function () {
        if (this.vrManager && this.vrManager.isStarted) {
            this.vrManager.stop();
            this.view.renderGraph();
        }
        this.keyHandler.unsubscribe('keyPressed', this.onKeyPressed);
        this.vrManager.unsubscribe('presenting:state:changed', this.onPresentingChanged);
        this.trigger('switched:off');
    };
    return VrViewController;
}(utils_1.Subscribable));
exports.VrViewController = VrViewController;
