"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var THREE = require("three");
var graphView_1 = require("./graph/graphView");
var widgetsView_1 = require("./widgets/widgetsView");
var utils_1 = require("../utils");
var vrManager_1 = require("../vrUtils/vrManager");
var CSS3DRenderer_1 = require("../utils/CSS3DRenderer");
exports.DEFAULT_CAMERA_DIST = 100;
exports.DEFAULT_SCREEN_PARAMETERS = {
    VIEW_ANGLE: 45,
    NEAR: 0.1,
    FAR: 10000,
};
var DiagramView = /** @class */ (function (_super) {
    tslib_1.__extends(DiagramView, _super);
    function DiagramView(props) {
        return _super.call(this, props) || this;
    }
    DiagramView.prototype.componentDidMount = function () {
        var _this = this;
        this.initScene();
        this.vrManager = new vrManager_1.VrManager(this);
        this.vrManager.on('presenting:state:changed', function () {
            _this.widgetsView.update();
        });
        this.initSubViews();
        this.subscribeOnModel();
        this.renderGraph();
        if (this.props.onViewMount) {
            this.props.onViewMount(this);
        }
    };
    DiagramView.prototype.mouseTo3dPos = function (event, distanceFromScreen) {
        if (distanceFromScreen === void 0) { distanceFromScreen = 600; }
        var bBox = this.meshHtmlContainer.getBoundingClientRect();
        return this.clientPosTo3dPos(utils_1.eventToPosition(event, bBox) || { x: 0, y: 0 }, distanceFromScreen);
    };
    DiagramView.prototype.clientPosTo3dPos = function (position, distanceFromScreen) {
        if (distanceFromScreen === void 0) { distanceFromScreen = 600; }
        var cameraPos = this.camera.position;
        var screenParameters = this.screenParameters;
        var vector = new THREE.Vector3((position.x / screenParameters.WIDTH) * 2 - 1, 1 - (position.y / screenParameters.HEIGHT) * 2, 1);
        var point = vector.unproject(this.camera);
        var distance = point.distanceTo(cameraPos);
        var k = distanceFromScreen / distance;
        var relativePoint = {
            x: point.x - cameraPos.x,
            y: point.y - cameraPos.y,
            z: point.z - cameraPos.z,
        };
        return {
            x: relativePoint.x * k + cameraPos.x,
            y: relativePoint.y * k + cameraPos.y,
            z: relativePoint.z * k + cameraPos.z,
        };
    };
    DiagramView.prototype.pos3dToClientPos = function (position) {
        var treePos = utils_1.vector3dToTreeVector3(position);
        var screenParameters = this.screenParameters;
        var vector = treePos.project(this.camera);
        return {
            x: (vector.x + 1) * screenParameters.WIDTH / 2,
            y: (1 - vector.y) * screenParameters.HEIGHT / 2,
        };
    };
    Object.defineProperty(DiagramView.prototype, "cameraState", {
        get: function () {
            var focusDirection = new THREE.Vector3(0, 0, -1);
            focusDirection.applyQuaternion(this.camera.quaternion);
            return {
                position: this.camera.position,
                focusDirection: focusDirection,
            };
        },
        set: function (cameraState) {
            var position = cameraState.position, focusDirection = cameraState.focusDirection;
            this.camera.position.x = position.x;
            this.camera.position.y = position.y;
            this.camera.position.z = position.z;
            if (focusDirection) {
                this.camera.lookAt(new THREE.Vector3(focusDirection.x, focusDirection.y, focusDirection.z));
            }
            this.renderGraph();
        },
        enumerable: true,
        configurable: true
    });
    DiagramView.prototype.resize = function () {
        this.screenParameters = tslib_1.__assign(tslib_1.__assign({}, this.screenParameters), { WIDTH: this.meshHtmlContainer.clientWidth, HEIGHT: this.meshHtmlContainer.clientHeight, ASPECT: this.meshHtmlContainer.clientWidth / this.meshHtmlContainer.clientHeight });
        this.renderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        this.overlayRenderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        this.camera.aspect = this.screenParameters.ASPECT;
        this.camera.updateProjectionMatrix();
        this.renderGraph();
    };
    DiagramView.prototype.initScene = function () {
        // Create main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(255, 255, 255);
        // this.scene.fog = new THREE.FogExp2(0xffffff, 0.0003);
        // Prepare perspective camera
        this.screenParameters = tslib_1.__assign(tslib_1.__assign({}, exports.DEFAULT_SCREEN_PARAMETERS), { WIDTH: this.meshHtmlContainer.clientWidth, HEIGHT: this.meshHtmlContainer.clientHeight, ASPECT: this.meshHtmlContainer.clientWidth / this.meshHtmlContainer.clientHeight });
        this.camera = new THREE.PerspectiveCamera(this.screenParameters.VIEW_ANGLE, this.screenParameters.ASPECT, this.screenParameters.NEAR, this.screenParameters.FAR);
        this.camera.position.set(0, 0, exports.DEFAULT_CAMERA_DIST);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);
        // Add lights
        var dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(200, 200, 1000).normalize();
        this.scene.add(new THREE.AmbientLight(0x444444));
        this.camera.add(dirLight);
        this.camera.add(dirLight.target);
        // Prepare webgl renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        this.renderer.setClearColor('white');
        // Prepare sprite renderer (css3d)
        this.overlayRenderer = new CSS3DRenderer_1.CSS3DRenderer();
        this.overlayRenderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        this.meshHtmlContainer.appendChild(this.renderer.domElement);
        this.overlayHtmlContainer.appendChild(this.overlayRenderer.domElement);
        // Helper sphere
        var sphereGeometry = new THREE.SphereGeometry(this.screenParameters.FAR / 2, 35, 35);
        var sphereMaterial = new THREE.MeshBasicMaterial({
            wireframe: true, color: 0xf0f0f0,
        });
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(0, 0, 0);
        this.scene.add(sphere);
        // Finalize
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
    };
    DiagramView.prototype.initSubViews = function () {
        var _this = this;
        var viewOptions = this.props.viewOptions || {};
        this.graphView = new graphView_1.GraphView({
            vrManager: this.vrManager,
            graphModel: this.props.model.graph,
            nodeTemplateProvider: viewOptions.nodeTemplateProvider,
            linkTemplateProvider: viewOptions.linkTemplateProvider,
            onAdd3dObject: function (object) { return _this.scene.add(object); },
            onRemove3dObject: function (object) { return _this.scene.remove(object); },
        });
        this.widgetsView = new widgetsView_1.WidgetsView({
            diagramView: this,
            vrManager: this.vrManager,
            widgetsModel: this.props.model.widgetRegistry,
            onAdd3dObject: function (object) { return _this.scene.add(object); },
            onRemove3dObject: function (object) { return _this.scene.remove(object); },
        });
    };
    DiagramView.prototype.subscribeOnModel = function () {
        var _this = this;
        this.props.model.on('syncupdate', function (combinedEvent) {
            var events = combinedEvent.data;
            var updatedNodeIds = [];
            var updatedLinkIds = [];
            events.graphEvents.forEach(function (event) {
                switch (event.eventId) {
                    case 'add:nodes':
                        for (var _i = 0, _a = event.data; _i < _a.length; _i++) {
                            var node = _a[_i];
                            _this.graphView.registerNode(node);
                        }
                        break;
                    case 'remove:nodes':
                        for (var _b = 0, _c = event.data; _b < _c.length; _b++) {
                            var node = _c[_b];
                            _this.graphView.removeNodeView(node);
                        }
                        break;
                    case 'update:nodes':
                        for (var _d = 0, _e = event.data; _d < _e.length; _d++) {
                            var node = _e[_d];
                            updatedNodeIds.push(node.id);
                        }
                        break;
                    case 'add:links':
                        for (var _f = 0, _g = event.data; _f < _g.length; _f++) {
                            var link = _g[_f];
                            _this.graphView.registerLink(link);
                        }
                        break;
                    case 'remove:links':
                        for (var _h = 0, _j = event.data; _h < _j.length; _h++) {
                            var link = _j[_h];
                            _this.graphView.removeLinkView(link);
                        }
                        break;
                    case 'update:links':
                        for (var _k = 0, _l = event.data; _k < _l.length; _k++) {
                            var link = _l[_k];
                            updatedLinkIds.push(link.id);
                        }
                        break;
                }
            });
            var updatedWidgetIds = [];
            events.widgetEvents.forEach(function (event) {
                switch (event.eventId) {
                    case 'add:widget':
                        _this.widgetsView.registerWidgetViewForModel(event.data);
                        break;
                    case 'remove:widget':
                        _this.widgetsView.removeWidgetViewOfModel(event.data);
                        break;
                    case 'update:widget':
                        var widget = event.data;
                        updatedWidgetIds.push(widget.widgetId);
                        break;
                }
            });
            _this.graphView.update({ updatedNodeIds: updatedNodeIds, updatedLinkIds: updatedLinkIds });
            _this.widgetsView.update(updatedWidgetIds);
            _this.renderGraph();
        });
    };
    DiagramView.prototype.renderGraph = function () {
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
    };
    DiagramView.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { className: 'l3graph-main_screen' },
            React.createElement("div", { className: 'l3graph-main_screen__mesh-layer', ref: function (div) { return _this.meshHtmlContainer = div; } }),
            React.createElement("div", { className: 'l3graph-main_screen__overlay-layer', ref: function (div) { return _this.overlayHtmlContainer = div; } }));
    };
    return DiagramView;
}(React.Component));
exports.DiagramView = DiagramView;
