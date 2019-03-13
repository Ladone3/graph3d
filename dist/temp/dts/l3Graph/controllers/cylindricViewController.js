"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var sphericalViewController_1 = require("./sphericalViewController");
var CylindricalViewController = /** @class */ (function (_super) {
    tslib_1.__extends(CylindricalViewController, _super);
    function CylindricalViewController(view) {
        var _this = _super.call(this, view) || this;
        _this.label = 'Cylindrical View Controller';
        return _this;
    }
    CylindricalViewController.prototype.updateCameraPosition = function () {
        var cameraPosition = {
            x: Math.cos(this.cameraAngle.x) * this.cameraDistance * Math.cos(this.cameraAngle.y),
            y: Math.sin(this.cameraAngle.y) * this.cameraDistance,
            z: Math.sin(this.cameraAngle.x) * this.cameraDistance * Math.cos(this.cameraAngle.y),
        };
        var focusDirection = {
            x: 0,
            y: cameraPosition.y,
            z: 0,
        };
        this.view.cameraState = {
            position: cameraPosition,
            focusDirection: focusDirection,
        };
    };
    return CylindricalViewController;
}(sphericalViewController_1.SphericalViewController));
exports.CylindricalViewController = CylindricalViewController;
