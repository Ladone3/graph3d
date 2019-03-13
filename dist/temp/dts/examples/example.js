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
var NodeSprite = /** @class */ (function (_super) {
    tslib_1.__extends(NodeSprite, _super);
    function NodeSprite() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NodeSprite.prototype.render = function () {
        var label = this.props.label;
        return React.createElement("div", { className: 'l3graph-node-template' },
            "Label: ",
            label,
            " - redefined template.");
    };
    return NodeSprite;
}(React.Component));
var WidgetSprite = /** @class */ (function (_super) {
    tslib_1.__extends(WidgetSprite, _super);
    function WidgetSprite() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WidgetSprite.prototype.render = function () {
        var label = this.props.label;
        return React.createElement("div", { className: 'l3graph-widget-overlay' },
            "Super overlay with label: ",
            label,
            ".");
    };
    return WidgetSprite;
}(React.Component));
var NODE_OVERLAY = { id: 'node-overlay', value: React.createElement(NodeSprite, { label: '' }) };
var WIDGET_OVERLAY = { id: 'test-widget-overlay', value: React.createElement(WidgetSprite, { label: '' }) };
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
};
var CUSTOM_NODE_TEMPLATE_2 = {
    mesh: function () { return ({
        type: index_1.MeshKind.Obj,
        markup: cubePortal,
    }); },
    overlay: NODE_OVERLAY,
};
document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(React.createElement(index_1.L3Graph, {
        viewOptions: {
            // nodeTemplateProvider: (data: {label: string; types: string[]}) => {
            //     if (data.types.indexOf('l3graph-node-custome') !== -1) {
            //         return CUSTOM_NODE_TEMPLATE_2;
            //     } else {
            //         return CUSTOM_NODE_TEMPLATE_1;
            //     }
            // },
            linkTemplateProvider: function () { return ({
                color: 'green',
                thickness: 2,
            }); },
        },
        onComponentMount: onComponentMount,
    }), rootHtml);
    function onComponentMount(l3graph) {
        var graphElements = generateData_1.generateData(10);
        l3graph.model.graph.addNodes(graphElements.nodes);
        l3graph.model.graph.addLinks(graphElements.links);
        index_1.applyForceLayout3d(l3graph.model.graph, 30, 200);
        l3graph.registerWidget({
            getModel: function (context) { return new index_1.FocusNodeWidget(tslib_1.__assign(tslib_1.__assign({}, context), { widgetId: 'l3graph-react-node-widget' })); },
            getView: function (context) { return new index_1.ReactNodeWidgetView({
                model: context.widget,
                diagramView: context.diagramView,
                position: 'w',
                overlay: WIDGET_OVERLAY,
            }); },
        });
    }
});
