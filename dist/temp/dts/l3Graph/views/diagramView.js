"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var THREE = require("three");
var graphView_1 = require("./graphView");
var widgetsView_1 = require("./widgetsView");
exports.DEFAULT_CAMERA_DIST = 100;
var DiagramView = /** @class */ (function (_super) {
    tslib_1.__extends(DiagramView, _super);
    function DiagramView(props) {
        return _super.call(this, props) || this;
    }
    DiagramView.prototype.componentDidMount = function () {
        this.initScene();
        this.initSubViews();
        this.subscribeOnModel();
        if (this.props.onViewMount) {
            this.props.onViewMount(this);
        }
    };
    DiagramView.prototype.mouseTo3dPos = function (event, distanceFromScreen) {
        if (distanceFromScreen === void 0) { distanceFromScreen = 600; }
        var bbox = this.meshHtmlContainer.getBoundingClientRect();
        return this.clientPosTo3dPos({
            x: event.clientX - bbox.left,
            y: event.clientY - bbox.top,
        }, distanceFromScreen);
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
    DiagramView.prototype.initScene = function () {
        // Create main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(255, 255, 255);
        // this.scene.fog = new THREE.FogExp2(0xffffff, 0.0003);
        // Prepare perspective camera
        this.screenParameters = {
            WIDTH: this.meshHtmlContainer.clientWidth,
            HEIGHT: this.meshHtmlContainer.clientHeight,
            VIEW_ANGLE: 45,
            ASPECT: this.meshHtmlContainer.clientWidth / this.meshHtmlContainer.clientHeight,
            NEAR: 1,
            FAR: 10000,
        };
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
        this.overlayRenderer = new THREE.CSS3DRenderer();
        this.overlayRenderer.setSize(this.screenParameters.WIDTH, this.screenParameters.HEIGHT);
        this.meshHtmlContainer.appendChild(this.renderer.domElement);
        this.overlayHtmlContainer.appendChild(this.overlayRenderer.domElement);
        // Helper plane
        // const planeGeometry = new THREE.PlaneGeometry(800, 800, 10, 10);
        // const planeMaterial = new THREE.MeshBasicMaterial({
        //     wireframe: true, color: 0x000000, transparent: true, opacity: 0.5,
        // });
        // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        // plane.rotation.x = -0.5 * Math.PI;
        // plane.position.set(0, -300, 0);
        // this.scene.add(plane);
        // Helper sphere
        var sphereGeometry = new THREE.SphereGeometry(this.screenParameters.FAR / 2, 50, 50);
        var sphereMaterial = new THREE.MeshBasicMaterial({
            wireframe: true, color: 0x000000, transparent: true, opacity: 0.1,
        });
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(0, 0, 0);
        this.scene.add(sphere);
        // Finalize
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
    };
    DiagramView.prototype.initSubViews = function () {
        var viewOptions = this.props.viewOptions || {};
        this.graphView = new graphView_1.GraphView({
            graphModel: this.props.model.graph,
            scene: this.scene,
            nodeTemplateProvider: viewOptions.nodeTemplateProvider,
            linkTemplateProvider: viewOptions.linkTemplateProvider,
            simpleLinks: viewOptions.simpleLinks,
        });
        this.widgetsView = new widgetsView_1.WidgetsView({
            widgetsModel: this.props.model.widgets,
            scene: this.scene,
        });
    };
    DiagramView.prototype.subscribeOnModel = function () {
        var _this = this;
        this.props.model.on('syncupdate', function (combinedEvent) {
            var events = combinedEvent.data;
            var updatedElementIds = [];
            events.graphEvents.forEach(function (event, id) {
                updatedElementIds.push(id);
            });
            var updatedWidgetIds = [];
            events.widgetEvents.forEach(function (event, id) {
                updatedWidgetIds.push(id);
            });
            _this.graphView.update(updatedElementIds);
            _this.widgetsView.update(updatedWidgetIds);
            _this.renderGraph();
        });
        this.props.model.graph.on('add:elements', function (event) {
            for (var _i = 0, _a = event.data; _i < _a.length; _i++) {
                var element = _a[_i];
                _this.graphView.addElementView(element);
            }
            _this.renderGraph();
        });
        this.props.model.graph.on('remove:elements', function (event) {
            for (var _i = 0, _a = event.data; _i < _a.length; _i++) {
                var element = _a[_i];
                _this.graphView.removeElementView(element);
            }
            _this.renderGraph();
        });
    };
    DiagramView.prototype.renderGraph = function () {
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
    };
    DiagramView.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { className: 'o3d-main_screen' },
            React.createElement("div", { className: 'o3d-main_screen__mesh-layer', ref: function (div) { return _this.meshHtmlContainer = div; } }),
            React.createElement("div", { className: 'o3d-main_screen__overlay-layer', ref: function (div) { return _this.overlayHtmlContainer = div; } }));
    };
    return DiagramView;
}(React.Component));
exports.DiagramView = DiagramView;
