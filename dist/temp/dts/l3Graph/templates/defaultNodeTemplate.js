"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultOverlay_1 = require("./defaultOverlay");
exports.DEFAULT_NODE_TEMPLATE = {
    mesh: function (data) { return ({
        shape: 'sphere',
    }); },
    overlay: {
        get: function (data) {
            return defaultOverlay_1.DefaultNodeOverlay;
        },
        context: undefined,
    },
};
exports.DEFAULT_NODE_TEMPLATE_PROVIDER = function (types) {
    return exports.DEFAULT_NODE_TEMPLATE;
};
