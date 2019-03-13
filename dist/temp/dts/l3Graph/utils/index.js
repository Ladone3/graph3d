Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribable_1 = require("./subscribable");
tslib_1.__exportStar(require("./colorUtils"), exports);
tslib_1.__exportStar(require("./shapeUtils"), exports);
tslib_1.__exportStar(require("./subscribable"), exports);
tslib_1.__exportStar(require("./geometry"), exports);
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
}(subscribable_1.default));
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
function generate128BitID() {
    function random32BitDigits() {
        return Math.floor((1 + Math.random()) * 0x100000000)
            .toString(16).substring(1);
    }
    return random32BitDigits() + random32BitDigits() + random32BitDigits() + random32BitDigits();
}
exports.generate128BitID = generate128BitID;
