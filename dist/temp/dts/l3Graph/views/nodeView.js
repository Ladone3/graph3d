"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var react_1 = require("react");
var ReactDOM = require("react-dom");
var templates_1 = require("../templates");
var colorUtils_1 = require("../utils/colorUtils");
var shapeUtils_1 = require("../utils/shapeUtils");
exports.DEFAULT_SCALE = 20;
var NodeView = /** @class */ (function () {
    function NodeView(model, customTemplate) {
        this.model = model;
        this.boundingBox = new THREE.Box3();
        var template = tslib_1.__assign({}, templates_1.DEFAULT_NODE_TEMPLATE, customTemplate);
        var mesh = template.mesh(model.data);
        var Overlay = template.overlay.get(model.data);
        if (mesh) {
            if (templates_1.isObject3d(mesh)) {
                this.mesh = mesh;
            }
            else if (templates_1.isMeshPrimitive(mesh)) {
                this.mesh = shapeUtils_1.getPrimitive(mesh);
            }
            else if (templates_1.isMeshObj(mesh)) {
                var obj = mesh.obj;
                var colors_1 = mesh.colors || [];
                var loader = new THREE.OBJLoader();
                this.mesh = loader.parse(obj);
                var scale = mesh.scale || exports.DEFAULT_SCALE;
                this.mesh.scale.set(scale, scale, scale);
                var counter_1 = 0;
                var fallbackColor_1 = colors_1[0] || colorUtils_1.getColorByTypes(this.model.types);
                this.mesh.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({ color: colors_1[counter_1++] || fallbackColor_1 });
                    }
                });
            }
            // Calc mesh offset
            this.boundingBox.setFromObject(this.mesh)
                .getCenter(this.mesh.position)
                .multiplyScalar(-1);
            this.meshOffset = this.mesh.position.clone();
        }
        else {
            this.mesh = null;
        }
        if (Overlay) {
            this.htmlOverlay = document.createElement('DIV');
            this.htmlOverlay.className = 'o3d-node-html-container';
            this.htmlBody = document.createElement('DIV');
            this.htmlBody.className = 'o3d-node-html-view';
            this.htmlOverlay.appendChild(this.htmlBody);
            if (template.overlay.context) {
                var Context = templates_1.createContextProvider(template.overlay.context);
                ReactDOM.render(react_1.createElement(Context, null, react_1.createElement(Overlay, model.data)), this.htmlBody);
            }
            else {
                ReactDOM.render(react_1.createElement(Overlay, model.data), this.htmlBody);
            }
            this.overlay = new THREE.CSS3DSprite(this.htmlOverlay);
        }
        else {
            this.overlay = null;
        }
        this.update();
    }
    NodeView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    NodeView.prototype.update = function () {
        var position = this.model.position;
        // Update mesh
        if (this.mesh) {
            this.mesh.position.set(position.x + this.meshOffset.x, position.y + this.meshOffset.y, position.z + this.meshOffset.z);
        }
        // Update overlay
        if (this.overlay) {
            this.overlay.position.set(position.x, position.y, position.z);
        }
    };
    return NodeView;
}());
exports.NodeView = NodeView;
