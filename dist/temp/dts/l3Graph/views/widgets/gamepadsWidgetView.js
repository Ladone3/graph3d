"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var gamepadHandler_1 = require("../../vrUtils/gamepadHandler");
var GamepadsWidgetView = /** @class */ (function () {
    function GamepadsWidgetView(parameters) {
        this.boundingBox = new THREE.Box3();
        this.vrManager = parameters.vrManager;
        this.model = parameters.model;
        this.mesh = new THREE.Group();
        this.leftGamepad = this.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.mesh.add(this.leftGamepad);
        this.rightGamepad = this.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.mesh.add(this.rightGamepad);
        this.update();
    }
    GamepadsWidgetView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    GamepadsWidgetView.prototype.update = function () {
        if (this.vrManager.isStarted) {
            this.mesh.visible = true;
            var state = this.model.tools;
            // todo: add some semantic here
            var isLeftMeshChanged = this.leftGamepad.children[0] !== state.leftTool.mesh;
            if (isLeftMeshChanged) {
                if (this.leftGamepad.children[0]) {
                    this.leftGamepad.remove(this.leftGamepad.children[0]);
                }
                this.leftGamepad.add(state.leftTool.mesh);
            }
            var isRightMeshChanged = this.rightGamepad.children[0] !== state.rightTool.mesh;
            if (isRightMeshChanged) {
                if (this.rightGamepad.children[0]) {
                    this.rightGamepad.remove(this.rightGamepad.children[0]);
                }
                this.rightGamepad.add(state.rightTool.mesh);
            }
        }
        else {
            this.mesh.visible = false;
        }
    };
    return GamepadsWidgetView;
}());
exports.GamepadsWidgetView = GamepadsWidgetView;
