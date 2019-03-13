Object.defineProperty(exports, "__esModule", { value: true });
var sphericalViewController_1 = require("./sphericalViewController");
var cylindricalViewController_1 = require("./cylindricalViewController");
var openSpaceViewController_1 = require("./openSpaceViewController");
var vrViewController_1 = require("./vrViewController");
function DEFAULT_VIEW_CONTROLLERS_SET() {
    return [
        function (core, mouseHandler, keyHandler) {
            return new sphericalViewController_1.SphericalViewController(core, mouseHandler, keyHandler);
        },
        function (core, mouseHandler, keyHandler) {
            return new cylindricalViewController_1.CylindricalViewController(core, mouseHandler, keyHandler);
        },
        function (core, mouseHandler, keyHandler) {
            return new openSpaceViewController_1.OpenSpaceViewController(core, mouseHandler, keyHandler);
        },
        function (core, mouseHandler, keyHandler, gamepadHandler) {
            return new vrViewController_1.VrViewController(core, mouseHandler, keyHandler, gamepadHandler);
        },
    ];
}
exports.DEFAULT_VIEW_CONTROLLERS_SET = DEFAULT_VIEW_CONTROLLERS_SET;
