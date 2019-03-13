"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _THREE = require("three");
tslib_1.__exportStar(require("./defaultLinkTemplate"), exports);
tslib_1.__exportStar(require("./defaultNodeTemplate"), exports);
tslib_1.__exportStar(require("./defaultOverlay"), exports);
// ====
function isMeshObj(mesh) {
    return mesh.obj && typeof mesh.obj === 'string';
}
exports.isMeshObj = isMeshObj;
function isObject3d(mesh) {
    return mesh instanceof _THREE.Object3D;
}
exports.isObject3d = isObject3d;
function isMeshPrimitive(mesh) {
    return mesh.shape && [
        'cube',
        'sphere',
        'cone',
        'cylinder',
        'dodecahedron',
        'torus',
        'tetrahedron',
        'plane',
    ].indexOf(mesh.shape) !== -1;
}
exports.isMeshPrimitive = isMeshPrimitive;
