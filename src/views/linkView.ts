import * as THREE from 'three';
import { Link } from '../models/link';
import { Vectro3D } from '../models/models';
import { GraphElementView } from './views';

export class LinkView implements GraphElementView {
    private model: Link;

    private lineGeometry: THREE.Geometry;
    private lineMaterial: THREE.LineBasicMaterial;
    private line: THREE.Line;

    constructor(model: Link) {
        this.model = model;
        this.init();
    }

    public getMesh() {
        return this.line;
    }

    private init() {
        this.lineGeometry = new THREE.Geometry();
        this.lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);

        this.update();

        this.model.on('change:label', () => this.update());
        this.model.getTarget().on('change:position', () => this.update());
        this.model.getTarget().on('change:position', () => this.update());
    }

    private calculateVertices(
        source: Vectro3D,
        target: Vectro3D,
    ): THREE.Vector3[] {
        return [
            new THREE.Vector3(source.x, source.y, source.z),
            new THREE.Vector3(target.x, target.y, target.z),
        ];
    }

    private update() {
        const sourcePosition = this.model.getSource().getPosition();
        const targetPosition = this.model.getTarget().getPosition();
        // this.line.position.x = (sourcePosition.x + targetPosition.x) / 2;
        // this.line.position.y = (sourcePosition.y + targetPosition.y) / 2;
        // this.line.position.z = (sourcePosition.z + targetPosition.z) / 2;
        // this.lineGeometry.
        this.lineGeometry.vertices = this.calculateVertices(sourcePosition, targetPosition);
        this.lineGeometry.verticesNeedUpdate = true;
    }
}
