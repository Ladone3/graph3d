"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var point_1 = require("../point");
var SIZE_VALUE = 40;
var DEFAULT_NODE_PARAMETERS = {
    position: { x: 0, y: 0, z: 0 },
    size: { x: SIZE_VALUE, y: SIZE_VALUE, z: SIZE_VALUE, placeholder: true },
};
var Node = /** @class */ (function (_super) {
    tslib_1.__extends(Node, _super);
    function Node(_model, parameters) {
        if (parameters === void 0) { parameters = DEFAULT_NODE_PARAMETERS; }
        var _this = _super.call(this, parameters) || this;
        _this._model = _model;
        _this.incomingLinks = new Set();
        _this.outgoingLinks = new Set();
        _this.modelIsChanged = false;
        _this._size = parameters.size || DEFAULT_NODE_PARAMETERS.size;
        return _this;
    }
    Object.defineProperty(Node.prototype, "id", {
        get: function () {
            return this._model.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "data", {
        get: function () {
            return this._model.data;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.setData = function (data) {
        this._model.data = data;
        this.modelIsChanged = true;
        this.forceUpdate();
    };
    Object.defineProperty(Node.prototype, "model", {
        get: function () {
            return this._model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.setSize = function (size) {
        var previous = this._size;
        this._size = size;
        this.trigger('change:size', previous);
    };
    Node.prototype.forceUpdate = function () {
        this.trigger('force-update');
    };
    return Node;
}(point_1.Point));
exports.Node = Node;
