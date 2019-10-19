import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { OverlayAnchor, MockOverlayAnchor } from '../graph/overlayAnchor';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { ThreejsVrManager } from '../../vrUtils/webVr';
import { OCULUS_CONTROLLERS } from '../../vrUtils/gamepadHandler';

const SELECTION_COLOR = 'red';
const LEFT_GAMEPAD_COLOR = 'green';
const RIGHT_GAMEPAD_COLOR = 'blue';

export interface GamepadsWidgetViewParameters {
    model: GamepadsWidget;
    vrManager: ThreejsVrManager;
}

interface RenderedGamepad {
    id: number;
    group: THREE.Group;
    color: string;
    cylinder: THREE.Mesh;
    line: THREE.Line;
}

export class GamepadsWidgetView implements DiagramWidgetView {
    public readonly model: GamepadsWidget;
    public readonly mesh: THREE.Group;
    public readonly overlayAnchor: OverlayAnchor;

    private vrManager: ThreejsVrManager;
    private boundingBox: THREE.Box3 = new THREE.Box3();;
    private leftGamepad: RenderedGamepad;
    private rightGamepad: RenderedGamepad;

    constructor(parameters: GamepadsWidgetViewParameters) {
        // todo: do we really need MockAnchors? Probably undefined would be OK.
        this.overlayAnchor = new MockOverlayAnchor();
        this.vrManager = parameters.vrManager;
        this.model = parameters.model;
        
        this.mesh = new THREE.Group();
        this.leftGamepad = this.renderGamepad(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.mesh.add(this.leftGamepad.group);
        this.rightGamepad = this.renderGamepad(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.mesh.add(this.rightGamepad.group);
        
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
            line,
            color,
            cylinder,
            group,
        };
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        if (this.vrManager.enabled) {
            this.mesh.visible = true;
            const state = this.model.state;

            const lgp = this.leftGamepad;
            if (lgp && state.leftGamepad) {
                lgp.group.visible = true;
                const color = state.leftGamepad.triggerPressed ? SELECTION_COLOR : lgp.color;
                lgp.line.material = new THREE.LineBasicMaterial({color});
                lgp.cylinder.material = new THREE.MeshBasicMaterial({color});
            } else {
                this.leftGamepad.group.visible = false;
            }
            const rgp = this.rightGamepad;
            if (rgp && state.rightGamepad) {
                rgp.group.visible = true;
                const color = state.rightGamepad.triggerPressed ? SELECTION_COLOR : rgp.color;
                rgp.line.material = new THREE.LineBasicMaterial({color});
                rgp.cylinder.material = new THREE.MeshBasicMaterial({color});
            } else {
                this.rightGamepad.group.visible = false;
            }
        } else {
            this.mesh.visible = false;
        }
    }
}