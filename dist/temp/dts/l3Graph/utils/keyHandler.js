"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribable_1 = require("./subscribable");
exports.KEY_CODES = {
    UP: 40,
    DOWN: 38,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
    CTRL: 17,
    PLUS: 107,
    MINUS: 109,
    DELETE: 46,
    ESCAPE: 27,
};
var KeyHandler = /** @class */ (function (_super) {
    tslib_1.__extends(KeyHandler, _super);
    function KeyHandler() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.keyMap = new Set();
        _this.onKeyDown = function (event) {
            var size = _this.keyMap.size;
            var key = event.keyCode || event.which;
            _this.keyMap.add(key);
            var newSize = _this.keyMap.size;
            if (newSize > size && !_this.cancellation) {
                _this.cancellation = _this.start();
                _this.trigger('keyDown', _this.keyMap);
            }
        };
        _this.onKeyUp = function (event) {
            var key = event.keyCode || event.which;
            _this.keyMap.delete(key);
            if (_this.keyMap.size === 0 && _this.cancellation) {
                _this.cancellation.stop();
                _this.cancellation = undefined;
                _this.trigger('keyUp', _this.keyMap);
            }
        };
        return _this;
    }
    KeyHandler.prototype.switchOn = function () {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    };
    KeyHandler.prototype.switchOff = function () {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    };
    KeyHandler.prototype.start = function () {
        var _this = this;
        return animationFrameInterval(function () {
            _this.trigger('keyPressed', _this.keyMap);
        });
    };
    return KeyHandler;
}(subscribable_1.Subscribable));
exports.KeyHandler = KeyHandler;
var Cancellation = /** @class */ (function (_super) {
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
}(subscribable_1.Subscribable));
exports.Cancellation = Cancellation;
function animationFrameInterval(intervalCallback) {
    var cancellation = new Cancellation();
    var animationFrameId;
    var animate = function (time) {
        if (!cancellation.isCancelled) {
            intervalCallback();
            animationFrameId = requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);
    cancellation.on('cancel', function () {
        cancelAnimationFrame(animationFrameId);
    });
    return cancellation;
}
exports.animationFrameInterval = animationFrameInterval;
