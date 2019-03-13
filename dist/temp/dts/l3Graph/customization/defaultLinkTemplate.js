Object.defineProperty(exports, "__esModule", { value: true });
var defaultOverlay_1 = require("./defaultOverlay");
exports.DEFAULT_LINK_TEMPLATE = {
    color: 'gray',
    thickness: 1,
    overlay: defaultOverlay_1.DEFAULT_LINK_OVERLAY,
};
exports.DEFAULT_LINK_TEMPLATE_PROVIDER = function () {
    return exports.DEFAULT_LINK_TEMPLATE;
};
