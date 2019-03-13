"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
function generateData(nodeNumber, positionRange) {
    if (nodeNumber === void 0) { nodeNumber = 50; }
    if (positionRange === void 0) { positionRange = 100; }
    var data = {
        nodes: [],
        links: [],
    };
    var linkMap = new Set();
    for (var i = 0; i < nodeNumber; i++) {
        data.nodes.push(new index_1.Node({
            types: i % 10 === 0 ? ['o3d-node-custome'] : ['o3d-node'],
            data: { label: 'Node ' + i },
            position: {
                x: Math.random() * positionRange - positionRange / 2,
                y: Math.random() * positionRange,
                z: Math.random() * positionRange - positionRange / 2,
            },
        }));
    }
    for (var i = 0; i < nodeNumber; i++) {
        var sourceIndex = i;
        var targetIndex = Math.round(Math.random() * (data.nodes.length - 1));
        var key = sourceIndex + "~" + targetIndex;
        var key2 = targetIndex + "~" + sourceIndex;
        if (!linkMap.has(key) && !linkMap.has(key2) && sourceIndex !== targetIndex) {
            linkMap.add(key);
            data.links.push(new index_1.Link({
                label: 'Link ' + i,
                sourceId: data.nodes[sourceIndex].id,
                targetId: data.nodes[targetIndex].id,
            }));
        }
    }
    return data;
}
exports.generateData = generateData;
