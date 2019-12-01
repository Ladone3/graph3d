import * as THREE from 'three';
import { Node } from '../../models/graph/node';
import { SelectionWidget } from '../../models/widgets/selectionWidget';
import { DiagramWidgetView } from '../viewInterface';

export const SELECTION_PADDING = 5;

export interface SelectionViewParameters {
    model: SelectionWidget;
}

export class SelectionView implements DiagramWidgetView {
    public readonly material: THREE.MeshLambertMaterial;
    public readonly geometry: THREE.BoxGeometry;
    public readonly mesh: THREE.Mesh;

    readonly model: SelectionWidget;
    private boundingBox: THREE.Box3;

    constructor(parameters: SelectionViewParameters) {
        this.model = parameters.model;
        this.material = new THREE.MeshLambertMaterial({color: 'red', opacity: 0.1, transparent: true});
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const nodes: Node[] = [];
        for (const element of this.model.selectedElements) {
            if (element instanceof Node) {
                nodes.push(element);
            }
        }
        if (nodes.length > 0) {
            this.mesh.visible = true;
            const node = nodes[0];
            this.mesh.position.set(node.position.x, node.position.y, node.position.z);
            const nodeSize = typeof node.size === 'number' ? {
                x: node.size,
                y: node.size,
                z: node.size,
            } : node.size;
            this.mesh.scale.set(
                nodeSize.x + SELECTION_PADDING * 2,
                nodeSize.y + SELECTION_PADDING * 2,
                nodeSize.z + SELECTION_PADDING * 2,
            );
        } else {
            this.mesh.visible = false;
        }
    }
}
