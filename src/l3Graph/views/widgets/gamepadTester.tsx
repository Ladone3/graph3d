import * as THREE from 'three';
import { GamepadTool } from './gamepadTools/defaultTools';
import { DiagramWidgetView } from '../viewInterface';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';

export class GamepadTester<Descriptor extends GraphDescriptor> implements DiagramWidgetView {
    public readonly tool: GamepadTool;
    public readonly model: GamepadsWidget<Descriptor>;
    public readonly mesh: THREE.Group;

    private boundingBox: THREE.Box3 = new THREE.Box3();

    constructor(props: GamepadTool) {
        this.mesh = new THREE.Group();
        this.mesh.add(props.mesh);
        this.model = null;
        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        this.mesh.position.set(0, 0, 0);
    }
}
