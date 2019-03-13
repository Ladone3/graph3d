"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isXrNavigator(n) {
    return ('xr' in n) && typeof navigator.xr.requestDevice === 'function';
}
exports.isXrNavigator = isXrNavigator;
function isWebkitNavigator(n) {
    return Boolean('webkitGetGamepads' in n);
}
exports.isWebkitNavigator = isWebkitNavigator;
