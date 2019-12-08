import * as THREE from 'three';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { GamepadHandler, GAMEPAD_BUTTON, OCULUS_CONTROLLERS, GAMEPAD_EXTRA_MOVE_STEP, attach } from '../../../vrUtils/gamepadHandler';
import { prepareMesh, EventObject, Subscribable, threeVector3ToVector3d, setColor, setMaterial } from '../../../utils';
import { MeshObj, MeshKind } from '../../../customisation';
import { GamepadTool } from './defaultTools';
import { DiagramModel } from '../../../models/diagramModel';
import { Element, NodeDefinition } from '../../../models/graph/graphModel';
import { VrManager } from '../../../vrUtils/vrManager';
import { htmlToImage } from '../../../utils/htmlToSprite';
import { DEFAULT_SCREEN_PARAMETERS } from '../../diagramView';

export interface StateControllerEvents {
    'update': void;
}

export interface EditorState {
    node?: NodeDefinition;
    displayImage?: HTMLImageElement;
}

export abstract class StateCore extends Subscribable<StateControllerEvents> {
    abstract input(keyMap: Map<GAMEPAD_BUTTON, Element>): void;
    state: EditorState;
}

export const DISPLAY_TARGET_WIDTH = 0.2;
export const DISPLAY_SCALE = 10000;
export const MOC_OBJECT_RADIUS = 10;
export const MOC_OBJECT_NEAR_MARGIN = 20;

export class DefaultEditorStateCore extends StateCore {
    private _state: EditorState;
    private rootHtml: HTMLElement;
    private container: HTMLElement;
    private idCounter: number;

    constructor(private nodeIdPrefix: string) {
        super();
        this._state = {};
        this.idCounter = 0;

        const rootHtml = document.createElement('DIV');
        rootHtml.style.position = 'fixed';
        rootHtml.style.top = 'calc(50vh - 50px)';
        rootHtml.style.left = 'calc(50vw - 50px)';

        const holder = document.createElement('DIV');
        holder.style.position = 'relative';
        holder.style.width = '100%';
        holder.style.height = '100%';

        const container = document.createElement('DIV');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.backgroundColor = 'black';

        holder.appendChild(container);
        rootHtml.appendChild(holder);
        document.body.appendChild(rootHtml);

        this.container = container;
        this.rootHtml = rootHtml;

        this.render();
    }

    get state() {
        return this._state;
    }

    input(keyMap: Map<GAMEPAD_BUTTON, Element>) {
        this.render();
    }

    private render() {
        const idNumber = this.idCounter++;

        const node = {
            id: `${this.nodeIdPrefix}-${idNumber}`,
            data: {
                label: `New Node ${idNumber}`,
                types: ['l3graph-node'],
            },
            position: {x: 0, y: 0, z: 0},
        };
        ReactDOM.render(
            <div>
                <h3 style={{color: 'blue', fontSize: 24, whiteSpace: 'nowrap'}}>{node.data.label}</h3>
            </div>,
            this.container,
            () => this.onRenderDone(node)
        );
    }

    private onRenderDone(node: NodeDefinition) {
        this.rootHtml.style.display = 'block';
        htmlToImage(this.container as HTMLElement).then(img => {
            this._state = {
                node,
                displayImage: img,
            };
            this.rootHtml.style.display = 'none';
            this.trigger('update');
        });
    }
}

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
const DEFAULT_DISPLAY_MATERIAL = new THREE.MeshLambertMaterial({color: 'grey'});

export interface GamepadEditorToolProps {
    gamepadHandler: GamepadHandler;
    diagramModel: DiagramModel;
    vrManager: VrManager;
    stateCore: StateCore;
}

export class LeftGamepadEditorTool extends GamepadTool {
    protected display: THREE.Mesh;
    protected mockObject: THREE.Object3D;

    protected readonly stateController: StateCore;
    protected readonly BUTTON_CONFIG = {
        createButton: GAMEPAD_BUTTON.LEFT_TRIGGER,
        pushMock: GAMEPAD_BUTTON.Y,
        pullMock: GAMEPAD_BUTTON.X,
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

    constructor(protected props: GamepadEditorToolProps) {
        super();
        const {group, mockObject} = renderEditorToolMesh(this.COLOR, this.ROTATE_Y_ANGLE, DEFAULT_CREATION_DISTANCE);

        this.forGamepadId = OCULUS_CONTROLLERS.LEFT_CONTROLLER;
        this.mockObject = mockObject;
        this.mesh = group;
        this.stateController = props.stateCore;
        this.props.gamepadHandler.on('keyUp', this.onKeyUp);
        this.props.gamepadHandler.on('keyPressed', this.onKeyPressed);
        this.stateController.on('update', this.render);

        this.render();
    }

    private render = () => {
        this.renderDisplay();
    }

    private renderDisplay() {
        const {displayImage} = this.stateController.state;
        if (this.display) {
            this.mesh.remove(this.display);
            this.display = undefined;
        }

        let display: THREE.Mesh;
        if (displayImage) {
            const scaler = DISPLAY_TARGET_WIDTH * DISPLAY_SCALE / displayImage.width;

            const texture = new THREE.Texture(displayImage);
            texture.anisotropy = 16;
            texture.needsUpdate = true;

            display = new THREE.Mesh(
                new THREE.PlaneGeometry(
                    displayImage.width * scaler,
                    displayImage.height * scaler,
                ),
                new THREE.MeshLambertMaterial({map: texture, side: THREE.DoubleSide}),
            );
        } else {
            display = new THREE.Mesh(
                new THREE.PlaneGeometry(
                    DISPLAY_TARGET_WIDTH * DISPLAY_SCALE,
                    DISPLAY_TARGET_WIDTH * DISPLAY_SCALE,
                ),
                DEFAULT_DISPLAY_MATERIAL,
            );
        }

        display.scale.setScalar(1 / DISPLAY_SCALE);
        display.position.setX(-DISPLAY_TARGET_WIDTH);
        display.rotateX(-Math.PI / 6);
        this.mesh.add(display);
        this.display = display;
    }
    private onKeyUp = (e: EventObject<'keyUp', Map<GAMEPAD_BUTTON, Element>>) => {
        if (e.data.has(this.BUTTON_CONFIG.createButton)) {
            const {node} = this.stateController.state;
            this.setPosition(node);
            this.props.diagramModel.graph.addNodes([node]);
            this.stateController.input(e.data);
        }
    }

    private onKeyPressed = (e: EventObject<'keyPressed', Map<GAMEPAD_BUTTON, Element>>) => {
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

    private setPosition(node: NodeDefinition) {
        const sceen = this.mesh.parent.parent as THREE.Scene;
        const tool = this.mesh;
        attach(this.mockObject, this.mesh.parent.parent, sceen);
        node.position = threeVector3ToVector3d(this.mockObject.position);
        attach(this.mockObject, tool, sceen);
    }

    public onDiscard() {
        this.props.gamepadHandler.unsubscribe('keyUp', this.onKeyUp);
    }
}

export class RightGamepadEditorTool extends LeftGamepadEditorTool {
    constructor(props: GamepadEditorToolProps) {
        super(props);
        this.forGamepadId = OCULUS_CONTROLLERS.RIGHT_CONTROLLER;
    }

    protected readonly BUTTON_CONFIG = {
        createButton: GAMEPAD_BUTTON.RIGHT_TRIGGER,
        pushMock: GAMEPAD_BUTTON.B,
        pullMock: GAMEPAD_BUTTON.A,
    };

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
    body.rotateX(-Math.PI / 3);
    if (rotateY !== 0) {
        body.rotateY(rotateY);
    }

    const transparentMaterail = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: 'blue'});
    const mockObject = new THREE.Group();
    const mockObjectSphere = new THREE.Mesh(
        new THREE.SphereGeometry(MOC_OBJECT_RADIUS, MOC_OBJECT_RADIUS, MOC_OBJECT_RADIUS),
        transparentMaterail,
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
