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
        var label = this.props.label;
        return React.createElement("div", { className: 'o3d-node-template' },
            "Label: ",
            label,
            " - redefined template.");
    };
    return NodeOverlay;
}(React.Component));
exports.NodeOverlay = NodeOverlay;
var rootHtml = document.getElementById('rootHtml');
var CUSTOM_NODE_TEMPLATE_1 = {
    mesh: function (node) {
        var shapeNumber = Math.round(Math.random() * 9);
        if (shapeNumber === 0) {
            return {
                obj: person3d,
                scale: 0.2,
            };
        }
        else if (shapeNumber === 1) {
            return {
                obj: cat3d,
                scale: 1,
            };
        }
        else {
            return {
                shape: [
                    'cube',
                    'sphere',
                    'cone',
                    'cylinder',
                    'dodecahedron',
                    'torus',
                    'tetrahedron',
                    'plane',
                ][Math.round(Math.random() * 7)],
            };
        }
    },
};
var CUSTOM_NODE_TEMPLATE_2 = {
    mesh: function (node) { return ({
        obj: cubePortal,
    }); },
    overlay: {
        get: function (node) {
            return NodeOverlay;
        },
        context: undefined,
    },
};
document.addEventListener('DOMContentLoaded', function () {
    var graphElements = generateData_1.generateData(30);
    ReactDOM.render(React.createElement(index_1.L3Graph, {
        viewOptions: {
            nodeTemplateProvider: function (types) {
                if (types.indexOf('o3d-node-custome') !== -1) {
                    return CUSTOM_NODE_TEMPLATE_2;
                }
                else {
                    return CUSTOM_NODE_TEMPLATE_1;
                }
            },
            linkTemplateProvider: function () { return ({
                color: 'green',
                thickness: 2,
            }); },
        },
        elements: graphElements,
        onComponentMount: onComponentMount,
    }), rootHtml);
    function onComponentMount(graph) {
        index_1.applyForceLayout3d(graph.model.graph, 30, 100);
    }
});
