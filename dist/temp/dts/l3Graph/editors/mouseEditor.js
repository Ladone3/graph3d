"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var utils_1 = require("../utils");
var arrowHelper_1 = require("../models/arrowHelper");
var WHEEL_SPEED = 0.25;
var MouseEditor = /** @class */ (function () {
    function MouseEditor(diagramhModel, diagramView) {
        this.diagramhModel = diagramhModel;
        this.diagramView = diagramView;
        this.raycaster = new THREE.Raycaster();
        this.arrowHelper = new arrowHelper_1.ArrowHelper();
        this.diagramhModel.widgets.registerWidget(this.arrowHelper);
    }
    MouseEditor.prototype.onMouseDown = function (event) {
        var _this = this;
        var clickPoint = this.calcRay(event);
        var draggedNode = this.getIntersectedObject(clickPoint);
        if (draggedNode) {
            var nodeTreePos = utils_1.vector3DToTreeVector3(draggedNode.position);
            var cameraPos = this.diagramView.camera.position;
            var distanceToNode_1 = nodeTreePos.distanceTo(cameraPos);
            this.diagramhModel.selection = new Set([draggedNode]);
            this.arrowHelper.focusNode = draggedNode;
            var onWheel_1 = function (wheelEvent) {
                var e = wheelEvent;
                distanceToNode_1 -= (e.deltaX || e.deltaY || e.deltaZ) * WHEEL_SPEED;
                wheelEvent.stopPropagation();
                draggedNode.position = _this.diagramView.mouseTo3dPos(e, distanceToNode_1);
            };
            document.body.addEventListener('mousewheel', onWheel_1);
            utils_1.handleDragging(event, function (dragEvent) {
                draggedNode.position = _this.diagramView.mouseTo3dPos(dragEvent, distanceToNode_1);
            }, function () {
                _this.arrowHelper.focusNode = undefined;
                document.body.removeEventListener('mousewheel', onWheel_1);
            });
            return false;
        }
        return true;
    };
    MouseEditor.prototype.getIntersectedObject = function (viewDirection) {
        var _this = this;
        var meshes = [];
        var nodeMeshMap = [];
        this.diagramhModel.nodes.forEach(function (node) {
            var nodeView = _this.diagramView.graphView.views.get(node.id);
            if (nodeView.mesh) {
                if (nodeView.mesh instanceof THREE.Group) {
                    for (var _i = 0, _a = nodeView.mesh.children; _i < _a.length; _i++) {
                        var obj = _a[_i];
                        meshes.push(obj);
                        nodeMeshMap.push(node);
                    }
                }
                else {
                    meshes.push(nodeView.mesh);
                    nodeMeshMap.push(node);
                }
            }
            if (nodeView.overlay) {
                meshes.push(nodeView.overlay);
                nodeMeshMap.push(node);
            }
        });
        this.raycaster.set(this.diagramView.camera.position, viewDirection.sub(this.diagramView.camera.position).normalize());
        var intersects = this.raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            var selectedMesh = intersects[0].object;
            var index = meshes.indexOf(selectedMesh);
            return nodeMeshMap[index];
        }
    };
    MouseEditor.prototype.calcRay = function (event) {
        var view = this.diagramView;
        var bbox = view.meshHtmlContainer.getBoundingClientRect();
        var position = {
            x: event.clientX - bbox.left,
            y: event.clientY - bbox.top,
        };
        var screenParameters = view.screenParameters;
        var vector = new THREE.Vector3((position.x / screenParameters.WIDTH) * 2 - 1, 1 - (position.y / screenParameters.HEIGHT) * 2, 1);
        return vector.unproject(view.camera);
    };
    return MouseEditor;
}());
exports.MouseEditor = MouseEditor;
