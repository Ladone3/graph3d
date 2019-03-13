"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
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
    var getOffset = function (e) {
        var pp = e;
        var curPoint = {
            x: pp.screenX,
            y: pp.screenY,
        };
        return {
            x: curPoint.x - startPoint.x,
            y: curPoint.y - startPoint.y,
        };
    };
    var _onchange = function (e) {
        onChange(e, getOffset(e));
    };
    var _onend = function (e) {
        document.body.onmousemove = document.body.onmouseup = null;
        document.body.removeEventListener('mousemove', _onchange);
        document.body.removeEventListener('mouseup', _onend);
        if (onEnd) {
            onEnd(e, getOffset(e));
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
function distance(from, to) {
    return Math.sqrt(Math.pow(from.x - to.x, 2) +
        Math.pow(from.y - to.y, 2) +
        Math.pow(from.z - to.z, 2));
}
exports.distance = distance;
function inverse(vector) {
    return {
        x: -vector.x,
        y: -vector.y,
        z: -vector.z,
    };
}
exports.inverse = inverse;
function multiply(vector, k) {
    return {
        x: vector.x * k,
        y: vector.y * k,
        z: vector.z * k,
    };
}
exports.multiply = multiply;
function sum(vector1, vector2) {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
        z: vector1.z + vector2.z,
    };
}
exports.sum = sum;
function sub(vector1, vector2) {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
        z: vector1.z - vector2.z,
    };
}
exports.sub = sub;
function normalLeft(vector) {
    var hDir = normalize({
        x: vector.x,
        y: 0,
        z: vector.z,
    });
    return {
        x: hDir.z,
        y: 0,
        z: -hDir.x,
    };
}
exports.normalLeft = normalLeft;
function normalUp(vector) {
    var dir = normalize({
        x: vector.x,
        y: 0,
        z: vector.z,
    });
    return {
        x: -vector.y * dir.x,
        y: (1 - Math.abs(vector.y)),
        z: -vector.y * dir.z,
    };
}
exports.normalUp = normalUp;
function normalDown(vector) {
    return inverse(normalUp(vector));
}
exports.normalDown = normalDown;
function normalRight(vector) {
    return inverse(normalLeft(vector));
}
exports.normalRight = normalRight;
