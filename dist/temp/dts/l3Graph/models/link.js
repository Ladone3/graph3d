"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribeable_1 = require("../utils/subscribeable");
var utils_1 = require("../utils");
var LINK_HASH_POSTFIX = utils_1.createUUID();
exports.DEFAULT_LINK_ID = 'o3d-link';
var Link = /** @class */ (function (_super) {
    tslib_1.__extends(Link, _super);
    function Link(parameters) {
        var _this = _super.call(this) || this;
        _this._types = parameters.types || [exports.DEFAULT_LINK_ID];
        _this._label = parameters.label;
        _this._sourceId = parameters.sourceId;
        _this._targetId = parameters.targetId;
        return _this;
    }
    Object.defineProperty(Link.prototype, "id", {
        get: function () {
            return "Link~From(" + this._sourceId + ")With(" + this._types.join('/') + ")To(" + this._targetId + ")#" + LINK_HASH_POSTFIX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Link.prototype, "types", {
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
    Object.defineProperty(Link.prototype, "label", {
        get: function () {
            return this._label;
        },
        set: function (label) {
            if (this._label !== label) {
                this._label = label;
                this.trigger('force-update');
            }
        },
        enumerable: true,
        configurable: true
    });
    Link.prototype.forceUpdate = function () {
        this.trigger('force-update');
    };
    Link.prototype.remove = function () {
        this.trigger('remove');
    };
    return Link;
}(subscribeable_1.Subscribable));
exports.Link = Link;
function getGroupId(link) {
    return [link._sourceId, link._targetId].sort().join('<==>') + (":" + LINK_HASH_POSTFIX);
}
exports.getGroupId = getGroupId;
