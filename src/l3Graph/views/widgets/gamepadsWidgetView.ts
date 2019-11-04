import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { OCULUS_CONTROLLERS } from '../../vrUtils/gamepadHandler';
import { VrManager } from '../../vrUtils/vrManager';
import { setColor } from '../../utils';

const SELECTION_COLOR = 'red';
const LEFT_GAMEPAD_COLOR = 'green';
const RIGHT_GAMEPAD_COLOR = 'blue';

export interface GamepadsWidgetViewParameters {
    model: GamepadsWidget;
    vrManager: VrManager;
}

interface RenderedGamepad {
    id: number;
    mesh: THREE.Group;
    color: string;
}

export class GamepadsWidgetView implements DiagramWidgetView {
    public readonly model: GamepadsWidget;
    public readonly mesh: THREE.Group;

    private vrManager: VrManager;
    private boundingBox: THREE.Box3 = new THREE.Box3();;
    private leftGamepad: RenderedGamepad;
    private rightGamepad: RenderedGamepad;

    constructor(parameters: GamepadsWidgetViewParameters) {
        this.vrManager = parameters.vrManager;
        this.model = parameters.model;
        
        this.mesh = new THREE.Group();
        this.leftGamepad = this.renderGamepad(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.mesh.add(this.leftGamepad.mesh);
        this.rightGamepad = this.renderGamepad(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.mesh.add(this.rightGamepad.mesh);
        
        this.update();
    }

    private renderGamepad(gamepadId: number): RenderedGamepad {
        const group = this.vrManager.getController(gamepadId);
        const color = (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER ? LEFT_GAMEPAD_COLOR : RIGHT_GAMEPAD_COLOR);
        const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -50),
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({color});
        const line = new THREE.Line(pointerGeometry, lineMaterial);
        group.add(line);
    
        const material = new THREE.MeshBasicMaterial({color});
        const geometry = new THREE.CylinderBufferGeometry(0.01, 0.01, 0.3, 10);
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(0, 0, -0.05);
        cylinder.rotateX(Math.PI / 2);
        group.add(cylinder);
        
        return {
            id: gamepadId,
            color,
            mesh: group,
        };
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        if (this.vrManager.isStarted) {
            this.mesh.visible = true;
            const state = this.model.state;

            const lgp = this.leftGamepad;
            if (lgp && state.leftGamepad) {
                lgp.mesh.visible = true;
                const color = state.leftGamepad.triggerPressed ? SELECTION_COLOR : lgp.color;
                setColor(lgp.mesh, color);
            } else {
                lgp.mesh.visible = false;
            }
            const rgp = this.rightGamepad;
            if (rgp && state.rightGamepad) {
                rgp.mesh.visible = true;
                const color = state.rightGamepad.triggerPressed ? SELECTION_COLOR : rgp.color;
                setColor(rgp.mesh, color);
            } else {
                rgp.mesh.visible = false;
            }
        } else {
            this.mesh.visible = false;
        }
    }
}