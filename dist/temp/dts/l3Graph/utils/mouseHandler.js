"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var subscribable_1 = require("./subscribable");
var geometry_1 = require("./geometry");
exports.MIN_DRAG_OFFSET = 5;
var MouseHandler = /** @class */ (function (_super) {
    tslib_1.__extends(MouseHandler, _super);
    function MouseHandler(diagramModel, diagramView) {
        var _this = _super.call(this) || this;
        _this.diagramModel = diagramModel;
        _this.diagramView = diagramView;
        _this.dragging = false;
        _this.raycaster = new THREE.Raycaster();
        return _this;
    }
    Object.defineProperty(MouseHandler.prototype, "isPanning", {
        get: function () {
            return this.dragging && !this.mouseDownOnElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MouseHandler.prototype, "isDragging", {
        get: function () {
            return this.dragging && Boolean(this.mouseDownOnElement);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MouseHandler.prototype, "draggedElement", {
        get: function () {
            if (this.isDragging) {
                return this.mouseDownOnElement;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    MouseHandler.prototype.fireMouseDownEvent = function (event, element) {
        var _this = this;
        this.mouseDownOnElement = element || this.getIntersectedObject(event);
        this.dragging = false;
        handleDragging(event, function (e, offset) {
            if (_this.dragging) {
                if (_this.mouseDownOnElement) {
                    _this.trigger('elementDrag', { nativeEvent: e, element: _this.mouseDownOnElement });
                }
                else {
                    _this.trigger('paperDrag', { nativeEvent: e, offset: offset });
                }
            }
            else {
                var dist = geometry_1.length(offset);
                if (dist >= exports.MIN_DRAG_OFFSET) {
                    _this.dragging = true;
                    if (_this.mouseDownOnElement) {
                        _this.trigger('elementStartDrag', { nativeEvent: e, element: _this.mouseDownOnElement });
                    }
                    else {
                        _this.trigger('paperStartDrag', { nativeEvent: e, offset: offset });
                    }
                }
            }
        }, function (e, offset) {
            if (_this.dragging) {
                if (_this.mouseDownOnElement) {
                    _this.trigger('elementEndDrag', { nativeEvent: e, element: _this.mouseDownOnElement });
                }
                else {
                    _this.trigger('paperEndDrag', { nativeEvent: e, offset: offset });
                }
            }
            else {
                if (_this.mouseDownOnElement) {
                    _this.trigger('elementClick', { nativeEvent: e, element: _this.mouseDownOnElement });
                }
                else {
                    _this.trigger('paperClick', e);
                }
            }
            _this.dragging = false;
            _this.mouseDownOnElement = undefined;
        });
    };
    MouseHandler.prototype.fireScrollEvent = function (event, element) {
        event.stopPropagation();
        if (this.mouseDownOnElement) {
            this.dragging = true;
            this.trigger('elementDrag', { nativeEvent: event, element: this.mouseDownOnElement });
        }
        else {
            if (element) {
                this.trigger('elementScroll', { nativeEvent: event, element: element });
            }
            else {
                this.trigger('paperScroll', event);
            }
        }
    };
    MouseHandler.prototype.getIntersectedObject = function (event) {
        var _this = this;
        var view = this.diagramView;
        var bBox = view.meshHtmlContainer.getBoundingClientRect();
        var position = geometry_1.eventToPosition(event, bBox);
        if (!position) {
            return undefined;
        }
        var screenParameters = view.screenParameters;
        var vector = new THREE.Vector3((position.x / screenParameters.WIDTH) * 2 - 1, 1 - (position.y / screenParameters.HEIGHT) * 2, 1);
        var viewDirection = vector.unproject(view.camera);
        var _a = mapMeshes(this.diagramModel, this.diagramView), meshes = _a.meshes, nodeMeshMap = _a.nodeMeshMap;
        this.diagramModel.nodes.forEach(function (node) {
            var nodeView = _this.diagramView.graphView.nodeViews.get(node.id);
            if (nodeView && nodeView.mesh) {
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
        });
        this.raycaster.set(this.diagramView.camera.position, viewDirection.sub(this.diagramView.camera.position).normalize());
        var intersections = this.raycaster.intersectObjects(meshes);
        if (intersections.length > 0) {
            var selectedMesh = intersections[0].object;
            var index = meshes.indexOf(selectedMesh);
            return nodeMeshMap[index];
        }
        else {
            return undefined;
        }
    };
    return MouseHandler;
}(subscribable_1.Subscribable));
exports.MouseHandler = MouseHandler;
function mapMeshes(diagramModel, diagramView) {
    var meshes = [];
    var nodeMeshMap = [];
    diagramModel.nodes.forEach(function (node) {
        var nodeView = diagramView.graphView.nodeViews.get(node.id);
        if (nodeView && nodeView.mesh) {
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
    });
    return { meshes: meshes, nodeMeshMap: nodeMeshMap };
}
exports.mapMeshes = mapMeshes;
function handleDragging(downEvent, onChange, onEnd) {
    var startPoint = geometry_1.eventToPosition(downEvent);
    if (!startPoint) {
        return;
    }
    window.getSelection().removeAllRanges();
    var getOffset = function (e) {
        var curPoint = geometry_1.eventToPosition(e);
        if (!curPoint) {
            return undefined;
        }
        return {
            x: curPoint.x - startPoint.x,
            y: curPoint.y - startPoint.y,
        };
    };
    var _onChange = function (e) {
        var offset = getOffset(e);
        if (offset) {
            onChange(e, offset);
        }
        else {
            _onEnd(e);
        }
    };
    var _onEnd = function (e) {
        document.body.removeEventListener('mousemove', _onChange);
        document.body.removeEventListener('touchmove', _onChange);
        document.body.removeEventListener('mouseup', _onEnd);
        document.body.removeEventListener('touchend', _onEnd);
        if (onEnd) {
            onEnd(e, getOffset(e));
        }
    };
    document.body.addEventListener('mousemove', _onChange);
    document.body.addEventListener('touchmove', _onChange);
    document.body.addEventListener('mouseup', _onEnd);
    document.body.addEventListener('touchend', _onEnd);
}
exports.handleDragging = handleDragging;