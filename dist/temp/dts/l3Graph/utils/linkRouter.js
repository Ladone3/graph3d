"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geometry_1 = require("./geometry");
var LINK_OFFSET = 30;
var DefaultLinkRouter = /** @class */ (function () {
    function DefaultLinkRouter() {
    }
    DefaultLinkRouter.prototype.getLinkNeighbours = function (link) {
        return Array.from(link.source.outgoingLinks).filter(function (l) { return l.target === link.target; }).concat(Array.from(link.target.outgoingLinks).filter(function (l) { return l.target === link.source; }));
    };
    DefaultLinkRouter.prototype.getRout = function (link) {
        var group = this.getLinkNeighbours(link);
        var sourcePos = link.source.position;
        var targetPos = link.target.position;
        var mediana = geometry_1.multiply(geometry_1.sum(sourcePos, targetPos), 0.5);
        if (group.length === 1) {
            return [sourcePos, targetPos];
        }
        else {
            var linkIndex = group.indexOf(link);
            var groupSize = group.length;
            var inverseDirection = link.source !== group[0].source;
            var angle = (2 * Math.PI / groupSize) * (linkIndex + 1);
            // Calculate the kink point
            var originalDirection = geometry_1.normalize(geometry_1.sub(sourcePos, targetPos));
            var direction = inverseDirection ? geometry_1.inverse(originalDirection) : originalDirection;
            var dirRight = geometry_1.normalRight(direction);
            var dirUp = geometry_1.normalUp(direction);
            var offsetDir = geometry_1.normalize(geometry_1.sum(geometry_1.multiply(dirRight, Math.cos(angle)), geometry_1.multiply(dirUp, Math.sin(angle))));
            var offset = geometry_1.multiply(offsetDir, groupSize > 1 ? LINK_OFFSET : 0);
            var kinkPoint = geometry_1.sum(mediana, offset);
            return [sourcePos, kinkPoint, targetPos];
        }
    };
    return DefaultLinkRouter;
}());
exports.DefaultLinkRouter = DefaultLinkRouter;
/**
 * @param polyline
 * @param offset from 0 to 1
 */
function getPointAlongPolylineByRatio(polyline, ratio) {
    var length = computePolylineLength(polyline);
    return getPointAlongPolyline(polyline, length * ratio);
}
exports.getPointAlongPolylineByRatio = getPointAlongPolylineByRatio;
/**
 * @param polyline
 * @param offset from 0 to length of polyline
 */
function getPointAlongPolyline(polyline, offset) {
    if (polyline.length === 0) {
        throw new Error('Cannot compute a point for empty polyline');
    }
    if (offset < 0) {
        return polyline[0];
    }
    var currentOffset = 0;
    for (var i = 1; i < polyline.length; i++) {
        var previous = polyline[i - 1];
        var point = polyline[i];
        var segment = { x: point.x - previous.x, y: point.y - previous.y, z: point.z - previous.z };
        var segmentLength = geometry_1.vectorLength(segment);
        var newOffset = currentOffset + segmentLength;
        if (offset < newOffset) {
            var leftover = (offset - currentOffset) / segmentLength;
            return {
                x: previous.x + leftover * segment.x,
                y: previous.y + leftover * segment.y,
                z: previous.z + leftover * segment.z,
            };
        }
        else {
            currentOffset = newOffset;
        }
    }
    return polyline[polyline.length - 1];
}
exports.getPointAlongPolyline = getPointAlongPolyline;
function computePolylineLength(polyline) {
    var previous;
    return polyline.reduce(function (acc, point) {
        var segmentLength = previous ? geometry_1.vectorLength({
            x: point.x - previous.x,
            y: point.y - previous.y,
            z: point.z - previous.z,
        }) : 0;
        previous = point;
        return acc + segmentLength;
    }, 0);
}
exports.computePolylineLength = computePolylineLength;
