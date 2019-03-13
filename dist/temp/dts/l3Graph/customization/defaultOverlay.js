Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var DefaultLinkOverlayClass = (function (_super) {
    tslib_1.__extends(DefaultLinkOverlayClass, _super);
    function DefaultLinkOverlayClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultLinkOverlayClass.prototype.render = function () {
        var label = this.props.target.data.label;
        return React.createElement("div", { className: 'l3graph-link-html-view' }, label);
    };
    return DefaultLinkOverlayClass;
}(React.Component));
var DefaultNodeOverlayClass = (function (_super) {
    tslib_1.__extends(DefaultNodeOverlayClass, _super);
    function DefaultNodeOverlayClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultNodeOverlayClass.prototype.render = function () {
        var label = this.props.target.data.label;
        return React.createElement("div", { className: 'l3graph-default-node-view' }, label);
    };
    return DefaultNodeOverlayClass;
}(React.Component));
exports.DEFAULT_NODE_OVERLAY = {
    id: 'node-overlay',
    value: React.createElement(DefaultNodeOverlayClass, null),
};
exports.DEFAULT_LINK_OVERLAY = {
    id: 'link-overlay',
    value: React.createElement(DefaultLinkOverlayClass, null),
};
function createContextProvider(context) {
    var ContextProvider = (function (_super) {
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
function enrichOverlay(poorOverlay, data) {
    var overlayProps = tslib_1.__assign(tslib_1.__assign({}, poorOverlay.value.props), { target: data });
    return tslib_1.__assign(tslib_1.__assign({}, poorOverlay), { value: React.cloneElement(poorOverlay.value, overlayProps) });
}
exports.enrichOverlay = enrichOverlay;
