import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON, OCULUS_CONTROLLERS } from '../../../vrUtils/gamepadHandler';
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
    public forGamepadId: number;

    constructor() {
        super();
    }

    protected forceUpdate = () => {
        this.trigger('update:gamepad');
    }

    public abstract onDiscard(): void;
}

export class LeftGamepadTool extends GamepadTool {
    protected TARGET_BUTTON = GAMEPAD_BUTTON.LEFT_TRIGGER;
    constructor(protected props: GamepadToolProps) {
        super();
        this.forGamepadId = OCULUS_CONTROLLERS.LEFT_CONTROLLER;
        this.props.gamepadHandler = props.gamepadHandler;
        this.props.gamepadHandler.on('keyDown', this.updateMesh);
        this.props.gamepadHandler.on('keyUp', this.updateMesh);
        this.registerHighlighter();
        this.registerBearer();
        this.mesh = this.renderMesh();
    }

    protected get COLOR() {
        return LEFT_GAMEPAD_COLOR;
    }

    protected registerBearer() {
        const controller = this.props.vrManager.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.props.gamepadHandler.registerElementBearer(
            controller, {
                dragKey: GAMEPAD_BUTTON.LEFT_TRIGGER,
                dragToKey: GAMEPAD_BUTTON.X,
                dragFromKey: GAMEPAD_BUTTON.Y,
            }
        );
    }

    protected registerHighlighter() {
        const controller = this.props.vrManager.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.props.gamepadHandler.registerHighlighter(
            controller, (mesh: THREE.Object3D) => {
                const backUp = backupColors(mesh);
                setColor(mesh, SELECTION_COLOR);
                return (meshToRestore: THREE.Object3D) => restoreColors(meshToRestore, backUp);
            }
        );
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
        const color = this.props.gamepadHandler.keyPressed.has(this.TARGET_BUTTON) ? SELECTION_COLOR : this.COLOR;
        setColor(this.mesh, color);
        this.forceUpdate();
    }

    public onDiscard() {
        this.props.gamepadHandler.unsubscribe('keyUp', this.updateMesh);
        this.props.gamepadHandler.unsubscribe('keyDown', this.updateMesh);
    }
}

export class RightGamepadTool extends LeftGamepadTool {
    constructor(props: GamepadToolProps) {
        super(props);
        this.forGamepadId = OCULUS_CONTROLLERS.RIGHT_CONTROLLER;
    }

    protected TARGET_BUTTON = GAMEPAD_BUTTON.RIGHT_TRIGGER;
    protected get COLOR() {
        return RIGHT_GAMEPAD_COLOR;
    }

    protected registerBearer() {
        const controller = this.props.vrManager.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.props.gamepadHandler.registerElementBearer(
            controller, {
                dragKey: GAMEPAD_BUTTON.RIGHT_TRIGGER,
                dragToKey: GAMEPAD_BUTTON.A,
                dragFromKey: GAMEPAD_BUTTON.B,
            }
        );
    }

    protected registerHighlighter() {
        const controller = this.props.vrManager.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.props.gamepadHandler.registerHighlighter(
            controller, (mesh: THREE.Object3D) => {
                const backUp = backupColors(mesh);
                setColor(mesh, SELECTION_COLOR);
                return (meshToRestore: THREE.Object3D) => restoreColors(meshToRestore, backUp);
            }
        );
    }
}
