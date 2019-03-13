"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultOverlay_1 = require("./defaultOverlay");
var mesh_1 = require("./mesh");
exports.DEFAULT_NODE_TEMPLATE = {
    mesh: function () { return ({
        type: mesh_1.MeshKind.Primitive,
        shape: 'sphere',
    }); },
    overlay: defaultOverlay_1.DEFAULT_NODE_OVERLAY,
};
exports.DEFAULT_NODE_TEMPLATE_PROVIDER = function (data) {
    return exports.DEFAULT_NODE_TEMPLATE;
};
