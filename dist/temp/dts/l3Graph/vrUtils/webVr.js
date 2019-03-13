Object.defineProperty(exports, "__esModule", { value: true });
function isXrNavigator(navigator) {
    return 'xr' in navigator;
}
exports.isXrNavigator = isXrNavigator;
function hasVrDisplays(navigator) {
    return 'getVRDisplays' in navigator;
}
exports.hasVrDisplays = hasVrDisplays;
function isWebkitNavigator(n) {
    return Boolean('webkitGetGamepads' in n);
}
exports.isWebkitNavigator = isWebkitNavigator;
