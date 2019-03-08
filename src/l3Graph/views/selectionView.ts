import * as THREE from 'three';
import { DiagramElementView } from './diagramElementView';
import { Node } from '../models/node';
import { Selection } from '../models/selection';
import { isNode } from '../models/graphModel';
import { Vector3D } from '../models/primitives';
import { vector3DToTreeVector3, calcBounds } from '../utils';

const SELECTION_PADDING = 15;

export class SelectionView implements DiagramElementView<Selection> {
    public readonly model: Selection;
    public readonly material: THREE.MeshLambertMaterial;
    public readonly geometry: THREE.CubeGeometry;
    public readonly mesh: THREE.Group;
    public readonly overlay: THREE.CSS3DObject | null;

    private boundingBox: THREE.Box3;

    constructor(model: Selection) {
        this.model = model;
        this.material = new THREE.MeshLambertMaterial({color: 'red', opacity: 0.1, transparent: true});
        this.geometry = new THREE.CubeGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.overlay = null;
        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const points: Vector3D[] = []; // for a while
        this.model.selection.forEach(element => {
            if (isNode(element)) {
                points.push(element.position);
            }
        });
        if (points.length > 0) {
            this.mesh.visible = true;
            const {min, max, average} = calcBounds(points);

            this.mesh.position.set(average.x, average.y, average.z);
            this.mesh.scale.set(
                max.x - min.x + SELECTION_PADDING * 2,
                max.y - min.y + SELECTION_PADDING * 2,
                max.z - min.z + SELECTION_PADDING * 2
            );
        } else {
            this.mesh.visible = false;
        }
    }
}
