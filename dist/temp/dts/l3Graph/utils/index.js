Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./colorUtils"), exports);
tslib_1.__exportStar(require("./shapeUtils"), exports);
tslib_1.__exportStar(require("./subscribable"), exports);
tslib_1.__exportStar(require("./geometry"), exports);
function generate128BitID() {
    function random32BitDigits() {
        return Math.floor((1 + Math.random()) * 0x100000000)
            .toString(16).substring(1);
    }
    return random32BitDigits() + random32BitDigits() + random32BitDigits() + random32BitDigits();
}
exports.generate128BitID = generate128BitID;
