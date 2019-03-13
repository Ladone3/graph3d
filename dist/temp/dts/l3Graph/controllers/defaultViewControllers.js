"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sphericalViewController_1 = require("./sphericalViewController");
var cylindricViewController_1 = require("./cylindricViewController");
var openSpaceViewController_1 = require("./openSpaceViewController");
exports.DEFAULT_VIEW_CONTROLLERS_SET = [
    function (view) { return new sphericalViewController_1.SphericalViewController(view); },
    function (view) { return new cylindricViewController_1.CylindricalViewController(view); },
    function (view) { return new openSpaceViewController_1.OpenSpaceViewController(view); },
];
