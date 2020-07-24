import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { OCULUS_CONTROLLERS } from '../../vrUtils/gamepadHandler';
import { VrManager } from '../../vrUtils/vrManager';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';

export interface GamepadsWidgetViewParameters<Descriptor extends GraphDescriptor> {
    model: GamepadsWidget<Descriptor>;
    vrManager: VrManager;
}

export class GamepadsWidgetView<Descriptor extends GraphDescriptor> implements DiagramWidgetView {
    public readonly model: GamepadsWidget<Descriptor>;
    public readonly mesh: THREE.Group;

    private vrManager: VrManager;
    private boundingBox: THREE.Box3 = new THREE.Box3();
    private leftGamepad: THREE.Group;
    private rightGamepad: THREE.Group;

    constructor(parameters: GamepadsWidgetViewParameters<Descriptor>) {
        this.vrManager = parameters.vrManager;
        this.model = parameters.model;

        this.mesh = new THREE.Group();
        this.leftGamepad = this.vrManager.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.mesh.add(this.leftGamepad);
        this.rightGamepad = this.vrManager.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.mesh.add(this.rightGamepad);

        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        if (this.vrManager.isStarted) {
            this.mesh.visible = true;
            const state = this.model.tools;

            // todo: add some semantic here
            const isLeftMeshChanged = this.leftGamepad.children[0] !== state.leftTool.mesh;
            if (isLeftMeshChanged) {
                if (this.leftGamepad.children[0]) {
                    this.leftGamepad.remove(this.leftGamepad.children[0]);
                }
                this.leftGamepad.add(state.leftTool.mesh);
            }

            const isRightMeshChanged = this.rightGamepad.children[0] !== state.rightTool.mesh;
            if (isRightMeshChanged) {
                if (this.rightGamepad.children[0]) {
                    this.rightGamepad.remove(this.rightGamepad.children[0]);
                }
                this.rightGamepad.add(state.rightTool.mesh);
            }
        } else {
            this.mesh.visible = false;
        }
    }
}
