import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { OverlayAnchor, MockOverlayAnchor } from '../graph/overlayAnchor';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { ThreejsVrManager, VrGamepad } from '../../vrUtils/webVr';

// const LINES_LENGTH = 100;
const SELECTION_COLOR = 'red';

export interface GamepadsWidgetViewParameters {
    model: GamepadsWidget;
    vrManager: ThreejsVrManager;
}

interface RenderedGamepad {
    id: number;
    group: THREE.Group;
    cylinder: THREE.Mesh;
    line: THREE.Line;
}

export class GamepadsWidgetView implements DiagramWidgetView {
    public readonly model: GamepadsWidget;
    public readonly mesh: THREE.Group;
    public readonly overlayAnchor: OverlayAnchor;

    private vrManager: ThreejsVrManager;
    private boundingBox: THREE.Box3 = new THREE.Box3();;
    private gamepads = new Map<number, RenderedGamepad>();

    constructor(parameters: GamepadsWidgetViewParameters) {
        // todo: do we really need MockAnchors? Probably undefined would be OK.
        this.overlayAnchor = new MockOverlayAnchor();
        this.vrManager = parameters.vrManager;
        this.model = parameters.model;
        this.model.setVrManager(this.vrManager);
        
        const gamepads = new Map<number, RenderedGamepad>();
        this.model.gamepads.forEach(gp => gamepads.set(gp.id, renderGamepad(gp)));
        
        const mesh = new THREE.Group();
        gamepads.forEach(gp => mesh.add(gp.group));

        this.gamepads = gamepads;
        this.mesh = mesh;
        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        if (this.vrManager.enabled) {
            this.mesh.visible = true;
            const gpModels = this.model.gamepads;
            this.gamepads.forEach(gp => {
                const gpModel = gpModels.get(gp.id);
                const color = gpModel.selectPressed ? SELECTION_COLOR : gpModel.color;
                gp.line.material = new THREE.LineBasicMaterial({color});
                gp.cylinder.material = new THREE.MeshBasicMaterial({color});
            })
        } else {
            this.mesh.visible = false;
        }
    }
}

function renderGamepad(gamepad: VrGamepad): RenderedGamepad {
    const group = gamepad.group;
    const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -50),
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({color: gamepad.color});
    const line = new THREE.Line(pointerGeometry, lineMaterial);
    group.add(line);

    const material = new THREE.MeshBasicMaterial({color: gamepad.color});
    const geometry = new THREE.CylinderBufferGeometry(0.01, 0.01, 0.3, 10);
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, 0, -0.05);
    cylinder.rotateX(Math.PI / 2);
    group.add(cylinder);
    
    return {
        id: gamepad.id,
        line,
        cylinder,
        group,
    };
}