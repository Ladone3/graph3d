"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var gamepadHandler_1 = require("../../vrUtils/gamepadHandler");
var utils_1 = require("../../utils");
var SELECTION_COLOR = 'red';
var LEFT_GAMEPAD_COLOR = 'green';
var RIGHT_GAMEPAD_COLOR = 'blue';
var GamepadsWidgetView = /** @class */ (function () {
    function GamepadsWidgetView(parameters) {
        this.boundingBox = new THREE.Box3();
        this.vrManager = parameters.vrManager;
        this.model = parameters.model;
        this.mesh = new THREE.Group();
        this.leftGamepad = this.renderGamepad(gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.mesh.add(this.leftGamepad.mesh);
        this.rightGamepad = this.renderGamepad(gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.mesh.add(this.rightGamepad.mesh);
        this.update();
    }
    ;
    GamepadsWidgetView.prototype.renderGamepad = function (gamepadId) {
        var group = this.vrManager.getController(gamepadId);
        var color = (gamepadId === gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER ? LEFT_GAMEPAD_COLOR : RIGHT_GAMEPAD_COLOR);
        var pointerGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -50),
        ]);
        var lineMaterial = new THREE.LineBasicMaterial({ color: color });
        var line = new THREE.Line(pointerGeometry, lineMaterial);
        group.add(line);
        var material = new THREE.MeshBasicMaterial({ color: color });
        var geometry = new THREE.CylinderBufferGeometry(0.01, 0.01, 0.3, 10);
        var cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(0, 0, -0.05);
        cylinder.rotateX(Math.PI / 2);
        group.add(cylinder);
        return {
            id: gamepadId,
            color: color,
            mesh: group,
        };
    };
    GamepadsWidgetView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    GamepadsWidgetView.prototype.update = function () {
        if (this.vrManager.isStarted) {
            this.mesh.visible = true;
            var state = this.model.state;
            var lgp = this.leftGamepad;
            if (lgp && state.leftGamepad) {
                lgp.mesh.visible = true;
                var color = state.leftGamepad.triggerPressed ? SELECTION_COLOR : lgp.color;
                utils_1.setColor(lgp.mesh, color);
            }
            else {
                lgp.mesh.visible = false;
            }
            var rgp = this.rightGamepad;
            if (rgp && state.rightGamepad) {
                rgp.mesh.visible = true;
                var color = state.rightGamepad.triggerPressed ? SELECTION_COLOR : rgp.color;
                utils_1.setColor(rgp.mesh, color);
            }
            else {
                rgp.mesh.visible = false;
            }
        }
        else {
            this.mesh.visible = false;
        }
    };
    return GamepadsWidgetView;
}());
exports.GamepadsWidgetView = GamepadsWidgetView;
