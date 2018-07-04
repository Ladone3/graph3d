import * as THREE from 'three';
import { Node } from './node';
import { Link } from './link';
import { Point3D } from './models';

export const DEFAULT_NODE_ID = 'o3d-node';

export interface GraphElementView {
    getMesh(): THREE.Mesh | THREE.Line;
}

export class NodeView implements GraphElementView {
    private model: Node;

    private sphereGeometry: THREE.SphereGeometry;
    private sphereMaterial: THREE.MeshLambertMaterial;
    private sphere: THREE.Mesh;

    constructor(model: Node) {
        this.model = model;
        this.init();
    }

    public getMesh() {
        return this.sphere;
    }

    private init() {
        this.sphereGeometry = new THREE.SphereGeometry(1, 10, 10);
        this.sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
        this.sphere = new THREE.Mesh(
            this.sphereGeometry,
            this.sphereMaterial
        );
        this.sphere.position.x = 0;
        this.sphere.position.y = 0;
        this.sphere.position.z = 0;

        this.update();

        this.model.on('change:position', this.update);
        this.model.on('change:label', this.update);
    }

    private update() {
        const position = this.model.getPosition();
        this.sphere.position.x = position.x;
        this.sphere.position.y = position.y;
        this.sphere.position.z = position.z;
    }
}

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

        this.model.on('change:label', this.update);
        this.model.getTarget().on('change:position', this.update);
        this.model.getTarget().on('change:position', this.update);
    }

    private calculateVertices(
        source: Point3D,
        target: Point3D,
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
    }
}
