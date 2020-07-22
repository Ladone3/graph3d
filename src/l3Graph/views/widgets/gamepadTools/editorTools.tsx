import * as THREE from 'three';

import { GamepadHandler, GAMEPAD_BUTTON, OCULUS_CONTROLLERS, GAMEPAD_EXTRA_MOVE_STEP, attach } from '../../../vrUtils/gamepadHandler';
import { prepareMesh, EventObject, threeVector3ToVector3d } from '../../../utils';
import { MeshObj, MeshKind } from '../../../customization';
import { GamepadTool } from './defaultTools';
import { DiagramModel } from '../../../models/diagramModel';
import { Element } from '../../../models/graph/graphModel';
import { VrManager } from '../../../vrUtils/vrManager';
import { DEFAULT_SCREEN_PARAMETERS } from '../../diagramView';
import { ImageMesh } from './imageMesh';
import { Vector3d } from '../../../models/structures';
import { GraphDescriptor } from '../../../models/graph/graphDescriptor';

export const DISPLAY_TARGET_WIDTH = 0.2;
export const DISPLAY_OFFSET = -5;
export const MOC_OBJECT_RADIUS = 10;
export const MOC_OBJECT_NEAR_MARGIN = 20;

const TOOL_MESH: MeshObj = {
    color: 'gray',
    preserveRatio: true,
    type: MeshKind.Obj,
    markup: require<string>('../../../../shapes/gamepadCreator.obj'),
};

const PLUS_MESH: MeshObj = {
    color: 'gray',
    preserveRatio: true,
    type: MeshKind.Obj,
    markup: require<string>('../../../../shapes/plus.obj'),
};

const LEFT_GAMEPAD_COLOR = 'green';
const RIGHT_GAMEPAD_COLOR = 'blue';
const DEFAULT_CREATION_DISTANCE = 150;

export interface GamepadEditorToolProps<Descriptor extends GraphDescriptor> {
    gamepadHandler: GamepadHandler<Descriptor>;
    diagramModel: DiagramModel<Descriptor>;
    vrManager: VrManager<Descriptor>;
}

export class LeftGamepadEditorTool<Descriptor extends GraphDescriptor> extends GamepadTool {
    protected display: ImageMesh;
    protected mockObject: THREE.Object3D;

    protected get BUTTON_CONFIG() {
        return {
            pushMock: GAMEPAD_BUTTON.Y,
            pullMock: GAMEPAD_BUTTON.X,
        };
    }

    protected get COLOR() {
        return LEFT_GAMEPAD_COLOR;
    }

    protected get ROTATE_Y_ANGLE() {
        return 0;
    }

    protected get gamepad() {
        return this.props.vrManager.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
    }

    constructor(protected props: GamepadEditorToolProps<Descriptor>) {
        super();
        const {group, mockObject} = renderEditorToolMesh(this.COLOR, this.ROTATE_Y_ANGLE, DEFAULT_CREATION_DISTANCE);

        this.forGamepadId = OCULUS_CONTROLLERS.LEFT_CONTROLLER;
        this.mockObject = mockObject;
        this.mesh = group;

        this.display = new ImageMesh({
            size: { x: DISPLAY_TARGET_WIDTH, y: DISPLAY_TARGET_WIDTH },
        });
        this.display.position.setX(-DISPLAY_TARGET_WIDTH + DISPLAY_OFFSET);
        this.display.rotateX(-Math.PI / 6);
        this.mesh.add(this.display);

        this.props.gamepadHandler.on('keyPressed', this.onKeyPressed);

        this.render();
    }

    public setDisplayImage(displayImage: HTMLImageElement) {
        this.display.setImage(displayImage);
        this.render();
    }

    public getTargetPosition(): Vector3d {
        const scene = (this.mesh.parent.parent || this.mesh.parent) as THREE.Scene;
        const tool = this.mesh;
        attach(this.mockObject, scene, scene);
        const targetPosition = threeVector3ToVector3d(this.mockObject.position);
        attach(this.mockObject, tool, scene);
        return targetPosition;
    }

    public onDiscard() {
        this.props.gamepadHandler.unsubscribe('keyPressed', this.onKeyPressed as any);
    }

    protected render = () => {
        this.display.position.setX(-DISPLAY_TARGET_WIDTH + DISPLAY_OFFSET);
    }

    protected onKeyPressed = (e: EventObject<'keyPressed', Map<GAMEPAD_BUTTON, Element<Descriptor>>>) => {
        if (e.data.has(this.BUTTON_CONFIG.pushMock) || e.data.has(this.BUTTON_CONFIG.pullMock)) {
            let distance = this.mockObject.position.z;
            if (e.data.has(this.BUTTON_CONFIG.pushMock) && !e.data.has(this.BUTTON_CONFIG.pullMock)) {
                distance -= GAMEPAD_EXTRA_MOVE_STEP;
            } else if (e.data.has(this.BUTTON_CONFIG.pullMock) && !e.data.has(this.BUTTON_CONFIG.pushMock)) {
                distance += GAMEPAD_EXTRA_MOVE_STEP;
            }
            const limitedValue = Math.max(
                Math.min(
                    Math.abs(distance),
                    DEFAULT_SCREEN_PARAMETERS.FAR,
                ),
                DEFAULT_SCREEN_PARAMETERS.NEAR + MOC_OBJECT_RADIUS / 2 + MOC_OBJECT_NEAR_MARGIN)
            ;
            this.mockObject.position.setZ(-limitedValue);
        }
    }
}

export class RightGamepadEditorTool<Descriptor extends GraphDescriptor> extends LeftGamepadEditorTool<Descriptor> {
    constructor(props: GamepadEditorToolProps<Descriptor>) {
        super(props);
        this.forGamepadId = OCULUS_CONTROLLERS.RIGHT_CONTROLLER;
    }

    protected get BUTTON_CONFIG() {
        return {
            pushMock: GAMEPAD_BUTTON.B,
            pullMock: GAMEPAD_BUTTON.A,
        };
    }

    protected get gamepad() {
        return this.props.vrManager.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
    }

    protected get COLOR() {
        return RIGHT_GAMEPAD_COLOR;
    }

    protected get ROTATE_Y_ANGLE() {
        return Math.PI;
    }
}

function renderEditorToolMesh(color: string, rotateY: number, mockDist: number) {
    const group = new THREE.Group();

    const body = prepareMesh({...TOOL_MESH, color});
    body.scale.setScalar(0.005);
    // body.scale.setScalar(1);
    body.rotateX(-Math.PI / 3);
    if (rotateY !== 0) {
        body.rotateY(rotateY);
    }

    const transparentMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: 'blue'});
    const mockObject = new THREE.Group();
    const mockObjectSphere = new THREE.Mesh(
        new THREE.SphereGeometry(MOC_OBJECT_RADIUS, MOC_OBJECT_RADIUS, MOC_OBJECT_RADIUS),
        transparentMaterial,
    );
    const mockObjectPlus = prepareMesh(PLUS_MESH);
    mockObjectPlus.rotateX(Math.PI / 2);
    mockObjectPlus.scale.setScalar(0.1);
    mockObject.add(mockObjectPlus);
    mockObject.add(mockObjectSphere);
    mockObject.position.setZ(-mockDist);

    group.add(mockObject);
    group.add(body);
    return {group, mockObject};
}
