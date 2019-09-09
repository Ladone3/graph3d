import * as THREE from 'three';
import { Node } from '../models/node';
import { SelectionWidget } from '../models/widgets/selectionWidget';
import { OverlayAnchor, MockOverlayAnchor } from './overlayAnchor';
import { DiagramWidgetViewParameters, DiagramWidgetView } from './viewInterface';

const SELECTION_PADDING = 5;

export interface SelectionViewParameters extends DiagramWidgetViewParameters {
    model: SelectionWidget;
}

export class SelectionView extends DiagramWidgetView {
    public readonly material: THREE.MeshLambertMaterial;
    public readonly geometry: THREE.CubeGeometry;
    public readonly mesh: THREE.Group;
    public readonly overlayAnchor: OverlayAnchor;

    private readonly model: SelectionWidget;
    private boundingBox: THREE.Box3;

    constructor(parameters: SelectionViewParameters) {
        super(parameters);

        this.model = parameters.model;
        this.material = new THREE.MeshLambertMaterial({color: 'red', opacity: 0.1, transparent: true});
        this.geometry = new THREE.CubeGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.overlayAnchor = new MockOverlayAnchor();
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
