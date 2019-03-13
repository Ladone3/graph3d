"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
function generateData(nodeNumber, linkDublicationNumber, positionRange) {
    if (nodeNumber === void 0) { nodeNumber = 50; }
    if (linkDublicationNumber === void 0) { linkDublicationNumber = 1; }
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
        if (!linkMap.has(key) && sourceIndex !== targetIndex) {
            linkMap.add(key);
            for (var j = 0; j < linkDublicationNumber; j++) {
                data.links.push(new index_1.Link({
                    label: "Link_" + i + "_" + j,
                    sourceId: data.nodes[sourceIndex].id,
                    targetId: data.nodes[targetIndex].id,
                    types: ["Link_" + j],
                }));
            }
        }
    }
    return data;
}
exports.generateData = generateData;
