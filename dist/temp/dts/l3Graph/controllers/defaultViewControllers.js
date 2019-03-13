Object.defineProperty(exports, "__esModule", { value: true });
var sphericalViewController_1 = require("./sphericalViewController");
var cylindricViewController_1 = require("./cylindricViewController");
var openSpaceViewController_1 = require("./openSpaceViewController");
var vrViewController_1 = require("./vrViewController");
function DEFAULT_VIEW_CONTROLLERS_SET() {
    return [
        function (view, mouseHandler, keyHandler) {
            return new sphericalViewController_1.SphericalViewController(view, mouseHandler, keyHandler);
        },
        function (view, mouseHandler, keyHandler) {
            return new cylindricViewController_1.CylindricalViewController(view, mouseHandler, keyHandler);
        },
        function (view, mouseHandler, keyHandler) {
            return new openSpaceViewController_1.OpenSpaceViewController(view, mouseHandler, keyHandler);
        },
        function (view, mouseHandler, keyHandler, gamepadHandler) {
            return new vrViewController_1.VrViewController(view, mouseHandler, keyHandler, gamepadHandler);
        },
    ];
}
exports.DEFAULT_VIEW_CONTROLLERS_SET = DEFAULT_VIEW_CONTROLLERS_SET;
