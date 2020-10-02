import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { OCULUS_CONTROLLERS } from '../../input/gamepadHandler';
import { VrManager } from '../../vrUtils/vrManager';

export interface GamepadsWidgetViewParameters {
    model: GamepadsWidget;
    vrManager: VrManager;
}

export class GamepadsWidgetView implements DiagramWidgetView {
    public readonly model: GamepadsWidget;
    public readonly mesh: THREE.Group;

    private vrManager: VrManager;
    private boundingBox: THREE.Box3 = new THREE.Box3();
    private leftGamepad: THREE.Group;
    private rightGamepad: THREE.Group;

    constructor(parameters: GamepadsWidgetViewParameters) {
        this.vrManager = parameters.vrManager;
        this.model = parameters.model;
        const {leftTool, rightTool} = this.model.props;

        this.mesh = new THREE.Group();
        if (leftTool) {
            this.leftGamepad = this.vrManager.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
            this.mesh.add(this.leftGamepad);
        }
        if (rightTool) {
            this.rightGamepad = this.vrManager.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
            this.mesh.add(this.rightGamepad);
        }
        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        if (this.vrManager.isConnected) {
            this.mesh.visible = true;
            const {leftTool, rightTool} = this.model.props;

            if (leftTool) {
                // todo: add some semantic here
                const isLeftMeshChanged = this.leftGamepad.children[0] !== leftTool.mesh;
                if (isLeftMeshChanged) {
                    if (this.leftGamepad.children[0]) {
                        this.leftGamepad.remove(this.leftGamepad.children[0]);
                    }
                    this.leftGamepad.add(leftTool.mesh);
                }
            }

            if (rightTool) {
                const isRightMeshChanged = this.rightGamepad.children[0] !== rightTool.mesh;
                if (isRightMeshChanged) {
                    if (this.rightGamepad.children[0]) {
                        this.rightGamepad.remove(this.rightGamepad.children[0]);
                    }
                    this.rightGamepad.add(rightTool.mesh);
                }
            }
        } else {
            this.mesh.visible = false;
        }
    }
}
