"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var ReactDOM = require("react-dom");
var index_1 = require("../index");
var generateData_1 = require("./generateData");
require('./example.scss');
var cubePortal = require('./portalCube.obj');
var cat3d = require('./cat.obj');
var person3d = require('./dummy_obj.obj');
var NodeOverlay = /** @class */ (function (_super) {
    tslib_1.__extends(NodeOverlay, _super);
    function NodeOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NodeOverlay.prototype.render = function () {
        var name = this.props.target.data.name;
        return React.createElement("div", { className: 'l3graph-node-template' },
            "Label: ",
            name,
            ".");
    };
    return NodeOverlay;
}(React.Component));
var WidgetOverlay = /** @class */ (function (_super) {
    tslib_1.__extends(WidgetOverlay, _super);
    function WidgetOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WidgetOverlay.prototype.render = function () {
        var name = this.props.target.data.name;
        return React.createElement("div", { className: 'l3graph-widget-overlay' },
            "Super overlay with label: ",
            name,
            ".");
    };
    return WidgetOverlay;
}(React.Component));
var NODE_OVERLAY = { id: 'node-overlay', value: React.createElement(NodeOverlay, null) };
var WIDGET_OVERLAY = { id: 'test-widget-overlay', value: React.createElement(WidgetOverlay, null) };
var rootHtml = document.getElementById('rootHtml');
var CUSTOM_NODE_TEMPLATE_1 = {
    mesh: function () {
        var shapeNumber = Math.round(Math.random() * 8);
        // const randomSize = 10 + Math.round(Math.random() * 20);
        var size = undefined; // {x: randomSize, y: randomSize, z: randomSize};
        if (shapeNumber === 0) {
            return {
                type: index_1.MeshKind.Obj,
                markup: person3d,
                size: size,
            };
        }
        else if (shapeNumber === 1) {
            return {
                type: index_1.MeshKind.Obj,
                markup: cat3d,
                size: size,
            };
        }
        else {
            return {
                type: index_1.MeshKind.Primitive,
                shape: [
                    'cube',
                    'sphere',
                    'cone',
                    'cylinder',
                    'dodecahedron',
                    'torus',
                    'tetrahedron',
                ][Math.round(Math.random() * 6)],
                size: size,
            };
        }
    },
    overlay: NODE_OVERLAY,
};
document.addEventListener('DOMContentLoaded', function () {
    var l3Graph;
    mountGraph();
    function mountGraph() {
        ReactDOM.render(React.createElement(index_1.L3Graph, {
            viewOptions: {
                nodeTemplateProvider: function () {
                    return CUSTOM_NODE_TEMPLATE_1;
                },
                linkTemplateProvider: function () { return ({
                    color: 'green',
                    thickness: 2,
                }); },
            },
            onComponentMount: onComponentMount,
        }, React.createElement(index_1.Toolbar, {
            viewControllers: l3Graph ? l3Graph.getViewControllers() : [],
            selectedViewController: l3Graph ? l3Graph.getViewController() : undefined,
            onChangeViewController: function (viewController) {
                l3Graph.setViewController(viewController);
            },
            onApplyLayout: function () {
                index_1.applyForceLayout3d(l3Graph.model.graph, 30, 200);
            },
        })), rootHtml);
    }
    function onComponentMount(l3graph) {
        l3Graph = l3graph;
        var graphElements = generateData_1.generateData(10);
        l3graph.model.graph.addNodes(graphElements.nodes);
        l3graph.model.graph.addLinks(graphElements.links);
        index_1.applyForceLayout3d(l3graph.model.graph, 30, 200);
        l3graph.registerWidget({
            getModel: function (context) {
                return new index_1.FocusNodeWidget(tslib_1.__assign(tslib_1.__assign({}, context), { widgetId: 'l3graph-react-node-widget' }));
            },
            getView: function (context) { return new index_1.ReactNodeWidgetView({
                model: context.widget,
                diagramView: context.diagramView,
                position: 'w',
                overlay: WIDGET_OVERLAY,
            }); },
        });
        mountGraph();
    }
});
