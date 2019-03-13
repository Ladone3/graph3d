"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
function vector3dToTreeVector3(v) {
    var x = v.x, y = v.y, z = v.z;
    return new THREE.Vector3(x, y, z);
}
exports.vector3dToTreeVector3 = vector3dToTreeVector3;
function threeVector3ToVector3d(v) {
    var x = v.x, y = v.y, z = v.z;
    return { x: x, y: y, z: z };
}
exports.threeVector3ToVector3d = threeVector3ToVector3d;
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
function length(from) {
    return distance(from, { x: 0, y: 0 });
}
exports.length = length;
function vectorLength(_a) {
    var x = _a.x, y = _a.y, z = _a.z;
    return Math.sqrt(x * x + y * y + z * z);
}
exports.vectorLength = vectorLength;
function distance(from, to) {
    var from3d = tslib_1.__assign({ z: 0 }, from);
    var to3d = tslib_1.__assign({ z: 0 }, to);
    return Math.sqrt(Math.pow(from3d.x - to3d.x, 2) +
        Math.pow(from3d.y - to3d.y, 2) +
        Math.pow((from3d.z || 0) - to3d.z, 2));
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
    var normalL = vector3dToTreeVector3(normalLeft(vector));
    var quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(normalL, -Math.PI / 2);
    var treeVector = vector3dToTreeVector3(vector).applyQuaternion(quaternion);
    return threeVector3ToVector3d(treeVector);
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
function eventToPosition(event, viewBox) {
    var offset = viewBox || { left: 0, top: 0 };
    if (event instanceof MouseEvent) {
        return {
            x: event.clientX - offset.left,
            y: event.clientY - offset.top,
        };
    }
    else if (event instanceof TouchEvent) {
        var touches = event.touches;
        var firstTouch = touches.item(0);
        if (firstTouch) {
            return {
                x: firstTouch.clientX - offset.left,
                y: firstTouch.clientY - offset.top,
            };
        }
        else {
            return undefined;
        }
    }
    else {
        return undefined;
    }
}
exports.eventToPosition = eventToPosition;
function getModelFittingBox(_a) {
    var x = _a.x, y = _a.y, z = _a.z;
    var maxSide = Math.max(x, y, z);
    return {
        width: maxSide,
        height: maxSide,
        deep: maxSide,
    };
}
exports.getModelFittingBox = getModelFittingBox;
