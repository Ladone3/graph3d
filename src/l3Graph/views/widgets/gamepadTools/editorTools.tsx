import * as THREE from 'three';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { GamepadHandler, GAMEPAD_BUTTON, OCULUS_CONTROLLERS } from '../../../vrUtils/gamepadHandler';
import { prepareMesh, sum, EventObject, multiply, sub, Subscribable, preparePrimitive } from '../../../utils';
import { MeshObj, MeshKind, MeshPrimitive } from '../../../customisation';
import { GamepadTool } from './defaultTools';
import { DiagramModel } from '../../../models/diagramModel';
import { Element, NodeDefinition } from '../../../models/graph/graphModel';
import { VrManager } from '../../../vrUtils/vrManager';
import { htmlToImage } from '../../../utils/htmlToSprite';

export interface StateControllerEvents {
    'update': void;
}

export interface GamepadEditorToolProps {
    gamepadHandler: GamepadHandler;
    diagramModel: DiagramModel;
    vrManager: VrManager;
}

export interface EditorState {
    node?: NodeDefinition;
    displayImage?: HTMLImageElement;
    mesh?: THREE.Mesh;
}

export abstract class StateController extends Subscribable<StateControllerEvents> {
    abstract input(keyMap: Map<GAMEPAD_BUTTON, Element>): void;
    state: EditorState;
}

// export const DISPLAY_TARGET_WIDTH = 20;
export const DISPLAY_TARGET_WIDTH = 0.2;

export class DefaultEditorStateController extends StateController {
    private _state: EditorState;
    private rootHtml: HTMLElement;
    private idCounter: number;

    constructor(private nodeIdPrefix: string) {
        super();
        this._state = {};
        this.idCounter = 0;
        this.rootHtml = document.createElement('DIV');
        this.rootHtml.style.position = 'fixed';
        this.rootHtml.style.top = '0';
        this.rootHtml.style.left = '0';
        // this.rootHtml.style.transformOrigin = 'top left';
        this.rootHtml.style.transformOrigin = 'top left';
        // this.rootHtml.style.transform = 'scale(10)';
        this.rootHtml.style.pointerEvents = 'none';
        document.body.appendChild(this.rootHtml);
        this.render();
    }

    get state() {
        return this._state;
    }

    input(keyMap: Map<GAMEPAD_BUTTON, Element>) {
        this.render();
    }

    private render() {
        const l3mesh = this.generatel3Mesh();
        ReactDOM.render(
            <div style={{color: 'red'}}>
                <h3 style={{color: 'red', fontSize: 1000}}>{l3mesh.shape + this.idCounter}</h3>
            </div>,
            this.rootHtml,
            () => this.onRenderDone(l3mesh)
        );
    }

    private onRenderDone(l3mesh: MeshPrimitive) {
        const idNumber = this.idCounter++;
        const mesh = preparePrimitive(l3mesh);
        this.rootHtml.style.display = 'block';
        htmlToImage(this.rootHtml.firstElementChild as HTMLElement).then(img => {
            this._state = {
                node: {
                    id: `${this.nodeIdPrefix}-${idNumber}`,
                    data: {
                        label: `New Node ${idNumber}`,
                        types: ['l3graph-node'],
                    },
                    position: {x: 0, y: 0, z: 0},
                },
                displayImage: img,
                mesh,
            };
            this.rootHtml.style.display = 'none';
            this.trigger('update');
        });
    }

    private generatel3Mesh(): MeshPrimitive {
        return {
            type: MeshKind.Primitive,
            shape: [
                'cube',
                'sphere',
                'cone',
                'cylinder',
                'dodecahedron',
                'torus',
                'tetrahedron',
            ][Math.round(Math.random() * 6)] as any,
        };
    }
}

const MESH_OBJECT: MeshObj = {
    color: 'gray',
    preserveRatio: true,
    type: MeshKind.Obj,
    markup: require<string>('../../../../shapes/gamepadCreator.obj'),
};

const LEFT_GAMEPAD_COLOR = 'green';
const RIGHT_GAMEPAD_COLOR = 'blue';
const DEFAULT_CREATION_DISTANCE = 250;
const DEFAULT_DISPLAY_MATERIAL = new THREE.MeshLambertMaterial({color: 'grey'});

export class LeftGamepadEditorTool extends GamepadTool {
    protected readonly body: THREE.Group;
    protected readonly display: THREE.Mesh;

    protected readonly stateController: StateController;
    protected readonly TARGET_BUTTON: GAMEPAD_BUTTON = GAMEPAD_BUTTON.LEFT_TRIGGER;

    protected get COLOR() {
        return LEFT_GAMEPAD_COLOR;
    }

    protected get ROTATE_Y_ANGLE() {
        return Math.PI;
    }

    protected get NODE_ID_PREFIX() {
        return 'Node-created-by-left-controller-';
    }

    protected get gamepad() {
        return this.props.vrManager.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
    }

    constructor(protected props: GamepadEditorToolProps) {
        super();
        const {group, body, display} = renderEditorToolMesh(this.COLOR, this.ROTATE_Y_ANGLE);

        this.display = display;
        this.body = body;
        this.mesh = group;

        this.stateController = new DefaultEditorStateController(this.NODE_ID_PREFIX);

        this.props.gamepadHandler.on('keyUp', this.onKeyUp);
        this.stateController.on('update', this.render);

        this.render();
    }

    private render = () => {
        const {displayImage} = this.stateController.state;
        if (displayImage) {
            const scaler = DISPLAY_TARGET_WIDTH / displayImage.width;
            displayImage.width *= scaler;
            displayImage.height *= scaler;

            const texture = new THREE.Texture(displayImage);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            texture.minFilter = THREE.NearestFilter;
            texture.needsUpdate = true;

            this.display.scale.set(1, displayImage.height, 1);
            this.display.material = new THREE.MeshLambertMaterial({map: texture, side: THREE.DoubleSide});
        } else {
            this.display.material = DEFAULT_DISPLAY_MATERIAL;
        }
    }

    private onKeyUp = (e: EventObject<'keyUp', Map<GAMEPAD_BUTTON, Element>>) => {
        // if (e.data.has(this.TARGET_BUTTON)) {
            // const {node} = this.stateController.state;
            // this.setPosition(node);
            // this.props.diagramModel.graph.addNodes([node]);
            this.stateController.input(e.data);
        // }
    }

    private setPosition(node: NodeDefinition) {
        node.position = sum(
            multiply(sub(
                this.gamepad.position,
                this.props.vrManager.camera.position
            ), DEFAULT_CREATION_DISTANCE),
            this.props.vrManager.camera.position
        );
    }

    public onDiscard() {
        this.props.gamepadHandler.unsubscribe('keyUp', this.onKeyUp);
    }
}

export class RightGamepadEditorTool extends LeftGamepadEditorTool {
    protected readonly TARGET_BUTTON = GAMEPAD_BUTTON.RIGHT_TRIGGER;

    protected get gamepad() {
        return this.props.vrManager.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
    }

    protected get COLOR() {
        return RIGHT_GAMEPAD_COLOR;
    }

    protected get ROTATE_Y_ANGLE() {
        return 0;
    }

    protected get NODE_ID_PREFIX() {
        return 'Node-created-by-right-controller-';
    }
}

function renderEditorToolMesh(color: string, rotateY: number) {
    const group = new THREE.Group();

    const body = prepareMesh({...MESH_OBJECT, color});
    body.scale.setScalar(0.005);
    body.rotateX(-Math.PI / 3);
    if (rotateY !== 0) {
        body.rotateY(rotateY);
    }

    const display = new THREE.Mesh(
        new THREE.PlaneGeometry(DISPLAY_TARGET_WIDTH, 1),
        DEFAULT_DISPLAY_MATERIAL,
    );
    display.position.setX(-DISPLAY_TARGET_WIDTH);
    display.rotateX(-Math.PI / 6);

    group.add(display);
    group.add(body);
    return {group, body, display};
}
