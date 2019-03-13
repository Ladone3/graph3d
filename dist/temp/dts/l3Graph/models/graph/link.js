Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var subscribable_1 = require("../../utils/subscribable");
exports.DEFAULT_LINK_ID = 'l3graph-link';
var Link = (function (_super) {
    tslib_1.__extends(Link, _super);
    function Link(model, parameters) {
        var _this = _super.call(this) || this;
        _this.model = model;
        _this.modelIsChanged = false;
        _this.source = parameters.source;
        _this.target = parameters.target;
        return _this;
    }
    Object.defineProperty(Link.prototype, "id", {
        get: function () {
            return this.model.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Link.prototype, "data", {
        get: function () {
            return this.model.data;
        },
        enumerable: true,
        configurable: true
    });
    Link.prototype.setData = function (data) {
        this.model.data = data;
        this.modelIsChanged = true;
        this.forceUpdate();
    };
    Link.prototype.forceUpdate = function () {
        this.trigger('force-update');
    };
    return Link;
}(subscribable_1.Subscribable));
exports.Link = Link;
