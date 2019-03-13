"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var subscribeable_1 = require("../utils/subscribeable");
var utils_1 = require("../utils");
exports.DEFAULT_NODE_TYPE_ID = 'o3d-node';
exports.DEFAULT_NODE_SIZE = { x: 1, y: 1, z: 1 };
var Node = /** @class */ (function (_super) {
    tslib_1.__extends(Node, _super);
    function Node(parameters) {
        var _this = _super.call(this) || this;
        _this.incomingLinks = new Map();
        _this.outgoingLinks = new Map();
        _this.id = parameters.id || lodash_1.uniqueId('Node-');
        _this._types = parameters.types || [exports.DEFAULT_NODE_TYPE_ID];
        _this._data = parameters.data;
        _this._position = parameters.position;
        return _this;
    }
    Object.defineProperty(Node.prototype, "types", {
        get: function () {
            return this._types;
        },
        set: function (types) {
            if (!utils_1.isTypesEqual(this._types, types)) {
                this._types = types;
                this.trigger('force-update');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            if (this._data !== data) {
                this._data = data;
                this.trigger('force-update');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (position) {
            var previous = this._position;
            this._position = position;
            this.trigger('change:position', previous);
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.forceUpdate = function () {
        this.trigger('force-update');
    };
    Node.prototype.remove = function () {
        this.trigger('remove');
    };
    return Node;
}(subscribeable_1.Subscribable));
exports.Node = Node;
