import * as THREE from 'three';
import { Node } from '../../models/graph/node';
import {
    NodeViewTemplate,
    MeshKind,
    ReactOverlay,
    enrichOverlay,
} from '../../customisation';
import { preparePrimitive, prepareMesh } from '../../utils/shapeUtils';
import { Vector3D } from '../../models/structures';
import { treeVector3ToVector3D, getModelFittingBox } from '../../utils';
import { AbstractOverlayAnchor } from './overlayAnchor';
import { DiagramElementView } from '../viewInterface';

export class NodeView implements DiagramElementView {
    public readonly model: Node;
    public readonly mesh: THREE.Object3D;
    public readonly overlayAnchor: NodeOverlayAnchor;

    private boundingBox: THREE.Box3;
    private meshOriginalSize: THREE.Vector3;
    private meshOffset: Vector3D;
    private preserveRatio: boolean;

    constructor(model: Node, template: NodeViewTemplate) {
        this.model = model;
        this.boundingBox = new THREE.Box3();
        const meshDescriptor = template.mesh();

        this.preserveRatio = meshDescriptor.preserveRatio || meshDescriptor.preserveRatio === undefined;

        if (meshDescriptor) {
            if (meshDescriptor.type === MeshKind.ThreeNative) {
                this.mesh = meshDescriptor.mesh;
            } else if (meshDescriptor.type === MeshKind.Primitive) {
                this.mesh = preparePrimitive(meshDescriptor);
            } else if (meshDescriptor.type === MeshKind.Obj) {
                this.mesh = prepareMesh(meshDescriptor);
            }
            // Calc bounding box
            this.boundingBox.setFromObject(this.mesh)
                .getCenter(this.mesh.position)
                .multiplyScalar(-1);
            this.meshOffset = treeVector3ToVector3D(this.mesh.position);
            this.meshOriginalSize = this.boundingBox.getSize(this.mesh.position).clone();

            if (meshDescriptor.size && this.model.size.placeholder) {
                this.model.setSize(meshDescriptor.size);
            }
        } else {
            this.mesh = null;
        }

        this.overlayAnchor = new NodeOverlayAnchor(this.model, this);
        if (template.overlay) {
            this.overlayAnchor.setOverlay(template.overlay, 'e');
        }

        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const position = this.model.position;

        if (this.mesh) {
            // Calc scale
            const scale = this.calcScale();
            this.mesh.scale.set(scale.x, scale.y, scale.z);
            // Calc bounding box
            this.boundingBox.setFromObject(this.mesh)
                .getCenter(this.mesh.position)
                .multiplyScalar(-1);

            this.mesh.position.set(
                position.x + this.meshOffset.x * scale.x,
                position.y + this.meshOffset.y * scale.y,
                position.z + this.meshOffset.z * scale.z,
            );
        }
        this.overlayAnchor.update();
    }

    private calcScale(): Vector3D {
        const size = this.meshOriginalSize;
        const prefferedSize = this.model.size;
        const scale = {
            x: prefferedSize.x / size.x,
            y: prefferedSize.y / size.y,
            z: prefferedSize.z / size.z,
        };
        if (this.preserveRatio) {
            const singleScale = Math.min(scale.x, scale.y, scale.z);
            return {
                x: singleScale,
                y: singleScale,
                z: singleScale,
            };
        } else {
            return scale;
        }
    }
}

export class NodeOverlayAnchor extends AbstractOverlayAnchor<Node, NodeView> {
    getModelFittingBox() {
        return {
            ...this.meshModel.position,
            ...getModelFittingBox(this.meshModel.size),
        };
    }

    protected enrichOverlay(pooreOverlay: ReactOverlay): ReactOverlay {
        return enrichOverlay(pooreOverlay, this.meshModel.data);
    }
}
