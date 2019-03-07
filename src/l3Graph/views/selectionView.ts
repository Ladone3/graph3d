import * as THREE from 'three';
import { DiagramElementView } from './diagramElementView';
import { Node } from '../models/node';
import { Selection } from '../models/selection';
import { isNode } from '../models/graphModel';
import { Vector3D } from '../models/primitives';
import { vector3DToTreeVector3 } from '../utils';

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
        const selecedNodes: Node[] = []; // for a while
        this.model.selection.forEach(el => {
            if (isNode(el)) {
                selecedNodes.push(el);
            }
        });
        if (selecedNodes.length > 0) {
            this.mesh.visible = true;
            const averagePos: Vector3D = {x: 0, y: 0, z: 0};
            const minPos: Vector3D = {x: Infinity, y: Infinity, z: Infinity};
            const maxPos: Vector3D = {x: -Infinity, y: -Infinity, z: -Infinity};
            for (const node of selecedNodes) {
                const p = node.position;
                averagePos.x += p.x;
                averagePos.y += p.y;
                averagePos.z += p.z;
                minPos.x = Math.min(minPos.x, p.x);
                minPos.y = Math.min(minPos.y, p.y);
                minPos.z = Math.min(minPos.z, p.z);
                maxPos.x = Math.max(maxPos.x, p.x);
                maxPos.y = Math.max(maxPos.y, p.y);
                maxPos.z = Math.max(maxPos.z, p.z);
            }
            averagePos.x /= selecedNodes.length;
            averagePos.y /= selecedNodes.length;
            averagePos.z /= selecedNodes.length;

            this.mesh.position.set(averagePos.x, averagePos.y, averagePos.z);
            this.mesh.scale.set(
                maxPos.x - minPos.x + SELECTION_PADDING * 2,
                maxPos.y - minPos.y + SELECTION_PADDING * 2,
                maxPos.z - minPos.z + SELECTION_PADDING * 2
            );
        } else {
            this.mesh.visible = false;
        }
    }
}
