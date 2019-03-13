Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var sphericalViewController_1 = require("./sphericalViewController");
var viewController_1 = require("./viewController");
var CylindricalViewController = (function (_super) {
    tslib_1.__extends(CylindricalViewController, _super);
    function CylindricalViewController(core, mouseHandler, keyHandler) {
        var _this = _super.call(this, core, mouseHandler, keyHandler) || this;
        _this.id = 'cylindrical-core-controller';
        _this.label = 'Cylindrical View Controller';
        return _this;
    }
    CylindricalViewController.prototype.updateCameraPosition = function () {
        var cameraPosition = {
            x: Math.cos(this.cameraAngle.x) * this.cameraDistance,
            y: Math.sin(this.cameraAngle.y) * this.cameraDistance,
            z: Math.sin(this.cameraAngle.x) * this.cameraDistance,
        };
        var focusDirection = {
            x: 0,
            y: cameraPosition.y,
            z: 0,
        };
        this.core.setCameraState({
            position: cameraPosition,
            focusDirection: focusDirection,
        });
    };
    CylindricalViewController.prototype.limitDistance = function (distance) {
        return Math.min(Math.max(0.001, distance), (this.core.screenParameters.FAR / 2 - viewController_1.BORDER_OPACITY) / 2);
    };
    return CylindricalViewController;
}(sphericalViewController_1.SphericalViewController));
exports.CylindricalViewController = CylindricalViewController;
