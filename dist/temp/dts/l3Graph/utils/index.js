"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
tslib_1.__exportStar(require("./colorUtils"), exports);
tslib_1.__exportStar(require("./keyHandler"), exports);
tslib_1.__exportStar(require("./shapeUtils"), exports);
tslib_1.__exportStar(require("./subscribeable"), exports);
function distance(from, to) {
    return Math.sqrt(Math.pow(from.x - to.x, 2) +
        Math.pow(from.y - to.y, 2) +
        Math.pow(from.z - to.z, 2));
}
exports.distance = distance;
function vector3DToTreeVector3(v) {
    var x = v.x, y = v.y, z = v.z;
    return new THREE.Vector3(x, y, z);
}
exports.vector3DToTreeVector3 = vector3DToTreeVector3;
function treeVector3ToVector3D(v) {
    var x = v.x, y = v.y, z = v.z;
    return { x: x, y: y, z: z };
}
exports.treeVector3ToVector3D = treeVector3ToVector3D;
function handleDragging(downEvent, onChange, onEnd) {
    var startPoint = {
        x: downEvent.screenX,
        y: downEvent.screenY,
    };
    window.getSelection().removeAllRanges();
    var _onchange = function (e) {
        var pp = e;
        var curPoint = {
            x: pp.screenX,
            y: pp.screenY,
        };
        var offset = {
            x: curPoint.x - startPoint.x,
            y: curPoint.y - startPoint.y,
        };
        onChange(e, offset);
    };
    var _onend = function () {
        document.body.onmousemove = document.body.onmouseup = null;
        document.body.removeEventListener('mousemove', _onchange);
        document.body.removeEventListener('mouseup', _onend);
        if (onEnd) {
            onEnd();
        }
    };
    document.body.addEventListener('mousemove', _onchange);
    document.body.addEventListener('mouseup', _onend);
}
exports.handleDragging = handleDragging;
function createUUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // tslint:disable-next-line
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        // tslint:disable-next-line
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
exports.createUUID = createUUID;
function isTypesEqual(types1, types2) {
    return types1.sort().join('') === types2.sort().join('');
}
exports.isTypesEqual = isTypesEqual;
function calcBounds(points) {
    var averagePos = { x: 0, y: 0, z: 0 };
    var minPos = { x: Infinity, y: Infinity, z: Infinity };
    var maxPos = { x: -Infinity, y: -Infinity, z: -Infinity };
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var p = points_1[_i];
        averagePos.x += p.x;
        averagePos.y += p.y;
        averagePos.z += p.z;
        minPos.x = Math.min(minPos.x, p.x);
        minPos.y = Math.min(minPos.y, p.y);
        minPos.z = Math.min(minPos.z, p.z);
        maxPos.x = Math.max(maxPos.x, p.x);
        maxPos.y = Math.max(maxPos.y, p.y);
        maxPos.z = Math.max(maxPos.z, p.z);
    }
    averagePos.x /= points.length;
    averagePos.y /= points.length;
    averagePos.z /= points.length;
    return {
        min: minPos,
        max: maxPos,
        average: averagePos,
    };
}
exports.calcBounds = calcBounds;
function normalize(vector) {
    var norma = Math.max(Math.abs(vector.x), Math.abs(vector.y), Math.abs(vector.z));
    return {
        x: vector.x / norma,
        y: vector.y / norma,
        z: vector.z / norma,
    };
}
exports.normalize = normalize;
function inverse(vector) {
    return {
        x: -vector.x,
        y: -vector.y,
        z: -vector.z,
    };
}
exports.inverse = inverse;
function miltiply(vector, k) {
    return {
        x: vector.x * k,
        y: vector.y * k,
        z: vector.z * k,
    };
}
exports.miltiply = miltiply;
function sum(vector1, vector2) {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
        z: vector1.z + vector2.z,
    };
}
exports.sum = sum;
