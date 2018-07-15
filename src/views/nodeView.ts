import * as THREE from 'three';
import { Node } from '../models/node';
import { GraphElementView } from './views';

export const DEFAULT_NODE_ID = 'o3d-node';

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
        this.sphereGeometry = new THREE.SphereGeometry(1, 5, 5);
        this.sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
        this.sphere = new THREE.Mesh(
            this.sphereGeometry,
            this.sphereMaterial,
        );
        this.sphere.position.x = 0;
        this.sphere.position.y = 0;
        this.sphere.position.z = 0;

        this.update();

        this.model.on('change:position', () => this.update());
        this.model.on('change:label', () => this.update());
        this.model.on('change:size', () => this.update());
    }

    private update() {
        const position = this.model.getPosition();
        // this.sphere.position.x = position.x;
        // this.sphere.position.y = position.y;
        // this.sphere.position.z = position.z;
        this.sphere.position.set(position.x, position.y, position.z);

        const size = this.model.getSize();
        this.sphere.scale.x = size.x;
        this.sphere.scale.y = size.y;
        this.sphere.scale.z = size.z;
    }
}
