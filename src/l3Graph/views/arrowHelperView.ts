import * as THREE from 'three';
import { DiagramElementView } from './diagramElementView';
import { ArrowHelper } from '../models/arrowHelper';

const LINES_LENGTH = 100;

export class ArrowHelperView implements DiagramElementView<ArrowHelper> {
    public readonly model: ArrowHelper;
    public readonly mesh: THREE.Group;
    public readonly overlay: THREE.CSS3DObject | null;

    private boundingBox: THREE.Box3;

    constructor(model: ArrowHelper) {
        this.model = model;

        this.mesh = new THREE.Group();

        // x
        const geometryX = new THREE.Geometry();
        geometryX.vertices.push(new THREE.Vector3(0, 0, 0));
        geometryX.vertices.push(new THREE.Vector3(LINES_LENGTH, 0, 0));
        const lineX = new THREE.Line(
            geometryX,
            new THREE.LineBasicMaterial({color: 0xff0000}),
            );
        const arrowX = new THREE.Mesh(
            new THREE.ConeGeometry(5, 20, 4),
            new THREE.MeshBasicMaterial({color: 0xff0000}),
        );
        arrowX.position.copy(geometryX.vertices[1]);
        arrowX.rotateZ(- Math.PI / 2);
        this.mesh.add(lineX);
        this.mesh.add(arrowX);

        // y
        const geometryY = new THREE.Geometry();
        geometryY.vertices.push(new THREE.Vector3(0, 0, 0));
        geometryY.vertices.push(new THREE.Vector3(0, LINES_LENGTH, 0));
        const lineY = new THREE.Line(
            geometryY,
            new THREE.LineBasicMaterial({color: 0x0000ff}),
        );
        const arrowY = new THREE.Mesh(
            new THREE.ConeGeometry(5, 20, 4),
            new THREE.MeshBasicMaterial({color: 0x0000ff}),
        );
        arrowY.position.copy(geometryY.vertices[1]);
        this.mesh.add(lineY);
        this.mesh.add(arrowY);

        // z
        const geometryZ = new THREE.Geometry();
        geometryZ.vertices.push(new THREE.Vector3(0, 0, 0));
        geometryZ.vertices.push(new THREE.Vector3(0, 0, LINES_LENGTH));
        const lineZ = new THREE.Line(
            geometryZ,
            new THREE.LineBasicMaterial({color: 0x00ff00}),
        );
        const arrowZ = new THREE.Mesh(
            new THREE.ConeGeometry(5, 20, 4),
            new THREE.MeshBasicMaterial({color: 0x00ff00}),
        );
        arrowZ.position.copy(geometryZ.vertices[1]);
        arrowZ.rotateX(Math.PI / 2);
        this.mesh.add(lineZ);
        this.mesh.add(arrowZ);

        this.boundingBox = new THREE.Box3();
        this.boundingBox.setFromObject(this.mesh);

        this.overlay = null;
        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const isWidgetVisible = Boolean(this.model.focusNode);
        this.mesh.visible = isWidgetVisible;

        const position = isWidgetVisible ? this.model.focusNode.position : { x: 0, y: 0, z: 0 };
        this.mesh.position.set(position.x, position.y, position.z);
    }
}
