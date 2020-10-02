import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON, OCULUS_CONTROLLERS, Controller } from '../../../input/gamepadHandler';
import { Subscribable, setColor, backupColors, restoreColors } from '../../../utils';
import { VrManager } from '../../../vrUtils/vrManager';

export interface GamepadToolProps {
    gamepadHandler: GamepadHandler;
    vrManager: VrManager;
}

export interface GamepadToolEvents {
    'update:gamepad': void;
}

const SELECTION_COLOR = 'red';
const LEFT_GAMEPAD_COLOR = 'green';
const RIGHT_GAMEPAD_COLOR = 'blue';

export abstract class GamepadTool extends Subscribable<GamepadToolEvents> {
    public mesh: THREE.Object3D;

    constructor() {
        super();
    }

    protected forceUpdate = () => {
        this.trigger('update:gamepad');
    }

    public abstract discard(): void;
}

export class LeftGamepadTool extends GamepadTool {
    constructor(protected props: GamepadToolProps) {
        super();
        this.props.gamepadHandler.on('keyDown', this.updateMesh);
        this.props.gamepadHandler.on('keyUp', this.updateMesh);
        this.mesh = this.renderMesh();
    }

    protected get controller() {
        return this.props.gamepadHandler.getController(
            OCULUS_CONTROLLERS.LEFT_CONTROLLER
        );
    }

    protected get COLOR() {
        return LEFT_GAMEPAD_COLOR;
    }

    private renderMesh() {
        const group = new THREE.Group();
        const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -50),
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({color: this.COLOR});
        const line = new THREE.Line(pointerGeometry, lineMaterial);
        group.add(line);

        const material = new THREE.MeshBasicMaterial({color: this.COLOR});
        const geometry = new THREE.CylinderBufferGeometry(0.01, 0.01, 0.3, 10);
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(0, 0, -0.05);
        cylinder.rotateX(Math.PI / 2);
        group.add(cylinder);
        return group;
    }

    private updateMesh = () => {
        const keyPressedMap = this.props.gamepadHandler.keyPressedMap.get(this.controller);
        const color = keyPressedMap && keyPressedMap.size > 0 ?
            SELECTION_COLOR : this.COLOR;
        setColor(this.mesh, color);
        this.forceUpdate();
    }

    public discard() {
        this.props.gamepadHandler.unsubscribe('keyUp', this.updateMesh);
        this.props.gamepadHandler.unsubscribe('keyDown', this.updateMesh);
    }
}

export class RightGamepadTool extends LeftGamepadTool {
    constructor(props: GamepadToolProps) {
        super(props);
    }

    protected TARGET_BUTTON = GAMEPAD_BUTTON.TRIGGER;
    protected get COLOR() {
        return RIGHT_GAMEPAD_COLOR;
    }
    protected get controller() {
        return this.props.gamepadHandler.getController(
            OCULUS_CONTROLLERS.RIGHT_CONTROLLER
        );
    }
}
