"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Toolbar = /** @class */ (function (_super) {
    tslib_1.__extends(Toolbar, _super);
    function Toolbar(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            selectedViewController: undefined,
        };
        return _this;
    }
    Toolbar.prototype.componentDidMount = function () {
        this.setState({
            selectedViewController: this.props.selectedViewController,
        });
    };
    Toolbar.prototype.setViewController = function (selectedViewController) {
        this.setState({ selectedViewController: selectedViewController });
        if (typeof this.props.onChangeViewController === 'function') {
            this.props.onChangeViewController(selectedViewController);
        }
    };
    Toolbar.prototype.render = function () {
        var _this = this;
        var _a = this.props, viewControllers = _a.viewControllers, onApplyLayout = _a.onApplyLayout;
        return React.createElement("div", { className: 'l3graph-toolbar' },
            React.createElement("button", { title: 'Help', onClick: function () { alert(HELP_TEXT); } },
                React.createElement("h2", { style: { margin: 0 } }, "?")),
            viewControllers.map(function (viewController, index) {
                return React.createElement("button", { title: viewController.label, key: "controller-button-" + index, onClick: function () { _this.setViewController(viewController); } }, viewController.label[0]);
            }),
            React.createElement("button", { id: 'l3graph-force-layout-button', title: 'Force layout', onClick: function () { onApplyLayout(); } }, "FL"));
    };
    return Toolbar;
}(React.Component));
exports.Toolbar = Toolbar;
var HELP_TEXT = "Next three buttons provide three ways of navigation in 3D space!\nHold mouse over the button to see full name of view controller. Use mouse and keyboard arrows for navigation\nS (Spherical view controller) - Camera is moving around the center of the diagram.\nC (Cylindrical view controller) - Camera is moving around the pivot which is placed in the center of the diagram.\nO (Open space view controller) - You can move in any direction. Change the view direction my mouse dragging,\nand change the position by using keyboard arrows.";
