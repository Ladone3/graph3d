"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
var Point = /** @class */ (function (_super) {
    tslib_1.__extends(Point, _super);
    function Point(parameters) {
        var _this = _super.call(this) || this;
        _this._position = parameters.position;
        return _this;
    }
    Object.defineProperty(Point.prototype, "position", {
        get: function () {
            return this._position;
        },
        enumerable: true,
        configurable: true
    });
    Point.prototype.setPosition = function (position) {
        var previous = this._position;
        this._position = position;
        this.trigger('change:position', previous);
    };
    return Point;
}(utils_1.Subscribable));
exports.Point = Point;
