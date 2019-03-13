Object.defineProperty(exports, "__esModule", { value: true });
function generateData(nodeNumber, linkDuplicationNumber) {
    if (nodeNumber === void 0) { nodeNumber = 50; }
    if (linkDuplicationNumber === void 0) { linkDuplicationNumber = 1; }
    var nodes = [];
    var links = [];
    var linkMap = new Set();
    for (var i = 0; i < nodeNumber; i++) {
        nodes.push({
            id: "Node-" + i,
            data: {
                name: 'Node ' + i,
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
            for (var j = 0; j < linkDuplicationNumber; j++) {
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
