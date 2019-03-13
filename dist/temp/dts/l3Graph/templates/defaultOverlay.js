"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var DefaultNodeOverlay = /** @class */ (function (_super) {
    tslib_1.__extends(DefaultNodeOverlay, _super);
    function DefaultNodeOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultNodeOverlay.prototype.render = function () {
        var label = this.props.label;
        return React.createElement("div", { className: 'o3d-default-node-view' }, label);
    };
    return DefaultNodeOverlay;
}(React.Component));
exports.DefaultNodeOverlay = DefaultNodeOverlay;
function createContextProvider(context) {
    var ContextProvider = /** @class */ (function (_super) {
        tslib_1.__extends(ContextProvider, _super);
        function ContextProvider() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ContextProvider.prototype.getChildContext = function () {
            return context;
        };
        ContextProvider.prototype.render = function () {
            return React.createElement("div", null, this.props.children);
        };
        return ContextProvider;
    }(React.Component));
    ContextProvider.childContextTypes = {};
    Object.keys(context).forEach(function (key) {
        ContextProvider.childContextTypes[key] = React.PropTypes.any.isRequired;
    });
    return ContextProvider;
}
exports.createContextProvider = createContextProvider;
