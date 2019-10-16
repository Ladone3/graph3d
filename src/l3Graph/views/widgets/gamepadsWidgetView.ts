import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { OverlayAnchor, MockOverlayAnchor } from '../graph/overlayAnchor';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { ThreejsVrManager } from '../../vrUtils/webVr';

// const LINES_LENGTH = 100;
const BASIC_COLOR_ORDER = ['red', 'blue'];

export interface GamepadsWidgetViewParameters {
    model: GamepadsWidget;
    vrManager: ThreejsVrManager;
}

interface RenderedGamepad {
    group: THREE.Group;
    line: THREE.Line;
}

export class GamepadsWidgetView implements DiagramWidgetView {
    public readonly model: GamepadsWidget;
    public readonly mesh: THREE.Group;
    public readonly overlayAnchor: OverlayAnchor;

    private boundingBox: THREE.Box3 = new THREE.Box3();;
    private gamepads: RenderedGamepad[] = [];

    constructor(parameters: GamepadsWidgetViewParameters) {
        // todo: do we really need MockAnchors? Probably undefined would be OK.
        this.overlayAnchor = new MockOverlayAnchor();
        this.model = parameters.model;
        this.model.setVrManager(parameters.vrManager);
        const gamepads = this.model.gamepads.map(gp => renderGamepad(gp));
        const mesh = new THREE.Group();
        for (const gp of gamepads) {
            mesh.add(gp.group);
        }
        this.gamepads = gamepads;
        this.mesh = mesh;
        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        this.gamepads; // for now do nothing let's see what is going to happen
    }
}

let colorIndex = 0;
function renderGamepad(gamepad: THREE.Group): RenderedGamepad {
    const color = BASIC_COLOR_ORDER[colorIndex++ % BASIC_COLOR_ORDER.length];
    const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -50),
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({color});
    const line = new THREE.Line(pointerGeometry, lineMaterial);
    gamepad.add(line);

    const material = new THREE.MeshBasicMaterial({color});
    const geometry = new THREE.CylinderBufferGeometry(0.01, 0.01, 0.3, 10);
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, 0, -0.05);
    cylinder.rotateX(Math.PI / 2);
    gamepad.add(cylinder);
    
    return {
        line: cylinder,
        // line,
        group: gamepad,
    };
}