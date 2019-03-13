"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateData(nodeNumber, linkDublicationNumber) {
    if (nodeNumber === void 0) { nodeNumber = 50; }
    if (linkDublicationNumber === void 0) { linkDublicationNumber = 1; }
    var nodes = [];
    var links = [];
    var linkMap = new Set();
    for (var i = 0; i < nodeNumber; i++) {
        nodes.push({
            id: "Node-" + i,
            data: {
                label: 'Node ' + i,
                types: i % 10 === 0 ? ['l3graph-node-custome'] : ['l3graph-node'],
            },
            position: { x: 0, y: 0, z: 0 },
        });
    }
    for (var i = 0; i < nodeNumber; i++) {
        var sourceIndex = i;
        var targetIndex = Math.round(Math.random() * (nodes.length - 1));
        var key = sourceIndex + "~" + targetIndex;
        if (!linkMap.has(key) && sourceIndex !== targetIndex) {
            linkMap.add(key);
            for (var j = 0; j < linkDublicationNumber; j++) {
                links.push({
                    id: "Link_" + key + "_" + j,
                    sourceId: nodes[sourceIndex].id,
                    targetId: nodes[targetIndex].id,
                    data: { label: "Link_" + i + "_" + j },
                });
            }
        }
    }
    return { nodes: nodes, links: links };
}
exports.generateData = generateData;
