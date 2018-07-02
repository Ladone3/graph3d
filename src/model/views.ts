import * as THREE from 'three';
import { Node } from './node';
import { Link } from './link';

export const DEFAULT_NODE_ID = 'o3d-node';

export interface GraphElementView {
    getMesh(): THREE.Mesh;
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
        this.sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
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

    private cubeGeometry: THREE.BoxGeometry;
    private cubeMaterial: THREE.MeshLambertMaterial;
    private cube: THREE.Mesh;

    constructor(model: Link) {
        this.model = model;
        this.init();
    }

    public getMesh() {
        return this.cube;
    }

    private init() {
        this.cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.cubeMaterial = new THREE.MeshPhongMaterial({
            shininess: 1, color: 0x00ff00,
        });
        this.cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
        this.cube.position.x = 0;
        this.cube.position.y = 0;
        this.cube.position.z = 0;

        this.update();

        this.model.on('change:label', this.update);
        this.model.getTarget().on('change:position', this.update);
        this.model.getTarget().on('change:position', this.update);
    }

    private update() {
        const sourcePosition = this.model.getSource().getPosition();
        const targetPosition = this.model.getTarget().getPosition();
        this.cube.position.x = (sourcePosition.x + targetPosition.x) / 2;
        this.cube.position.y = (sourcePosition.y + targetPosition.y) / 2;
        this.cube.position.z = (sourcePosition.z + targetPosition.z) / 2;
    }
}