import * as THREE from 'three';
import { GraphElementView } from './views';
import { Polygon } from '../models/polygon';

export class PolygonView implements GraphElementView {
    private model: Polygon;

    private polygonGeometry: THREE.Geometry;
    private polygonMaterial: THREE.MeshStandardMaterial;
    private polygon: THREE.Line;

    constructor(model: Polygon) {
        this.model = model;
        this.init();
    }

    public getMesh() {
        return this.polygon;
    }

    public update() {
        const vertices = this.model.getNodes().map(n => {
            const vertex = n.getPosition();
            return new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        });
        this.polygonGeometry.vertices = vertices;
        this.polygonGeometry.elementsNeedUpdate = true;

        this.polygonGeometry.computeFaceNormals();
        this.polygonGeometry.computeVertexNormals();
    }

    private init() {
        this.polygonGeometry = new THREE.Geometry();
        this.polygonMaterial = new THREE.MeshStandardMaterial({
            color : 0x00cc00, transparent: true, opacity: 0.2,
        });

        const vertices = this.model.getNodes().map(n => {
            const vertex = n.getPosition();
            return new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        });
        this.polygonGeometry.vertices = vertices;

        for (let face = 0 ; face < vertices.length - 2; face++) {
            this.polygonGeometry.faces.push( new THREE.Face3(0, face + 1, face + 2));
            this.polygonGeometry.faces.push( new THREE.Face3(face + 2, face + 1, 0));
        }
        this.polygonGeometry.computeFaceNormals();
        this.polygonGeometry.computeVertexNormals();

        this.polygon = new THREE.Mesh(this.polygonGeometry, this.polygonMaterial);
    }
}
