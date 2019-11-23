import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { prepareMesh, threeVector3ToVector3d, sum, EventObject } from '../../../utils';
import { MeshObj, MeshKind } from '../../../customisation';
import { GamepadTool } from './defaultTools';
import { DiagramModel } from '../../../models/diagramModel';
import { Element } from '../../../models/graph/graphModel';

export interface GamepadEditorToolProps {
    gamepadHandler: GamepadHandler;
    diagramModel: DiagramModel;
}

const MESH_OBJECT: MeshObj = {
    color: 'gray',
    preserveRatio: true,
    type: MeshKind.Obj,
    markup: require<string>('../../../../shapes/gamepadCreator.obj'),
};

const LEFT_GAMEPAD_COLOR = 'green';
const RIGHT_GAMEPAD_COLOR = 'blue';

let counter = 0;

export class LeftGamepadEditorTool extends GamepadTool {
    protected readonly TARGET_BUTTON: GAMEPAD_BUTTON = GAMEPAD_BUTTON.LEFT_TRIGGER;

    protected get COLOR() {
        return LEFT_GAMEPAD_COLOR;
    }

    protected get ROTATE_Y_ANGLE() {
        return Math.PI;
    }

    constructor(private props: GamepadEditorToolProps) {
        super();
        this.props.gamepadHandler.on('keyUp', this.onKeyUp);
        this.mesh = this.renderMesh();
    }

    private renderMesh() {
        const group = new THREE.Group();

        const mesh = prepareMesh({...MESH_OBJECT, color: this.COLOR});
        mesh.scale.setScalar(0.005);
        mesh.rotateX(Math.PI / 6 - Math.PI / 2);
        if (this.ROTATE_Y_ANGLE !== 0) {
            mesh.rotateY(Math.PI);
        }
        group.add(mesh);
        return group;
    }

    private onKeyUp = (e: EventObject<'keyUp', Map<GAMEPAD_BUTTON, Element>>) => {
        if (e.data.has(this.TARGET_BUTTON)) {
            const idNumber = counter++;
            this.props.diagramModel.graph.addNodes([{
                id: `created-node-${idNumber}`,
                data: {
                    label: `New Node ${idNumber}`,
                    types: ['l3graph-node'],
                },
                position: sum(
                    threeVector3ToVector3d(this.mesh.position),
                    {x: 0, y: 0, z: -100}
                ),
            }]);
        }
    }

    public onDiscard() {
        this.props.gamepadHandler.unsubscribe('keyUp', this.onKeyUp);
    }
}

export class RightGamepadEditorTool extends LeftGamepadEditorTool {
    protected readonly TARGET_BUTTON = GAMEPAD_BUTTON.RIGHT_TRIGGER;

    protected get COLOR() {
        return RIGHT_GAMEPAD_COLOR;
    }

    protected get ROTATE_Y_ANGLE() {
        return 0;
    }
}
