import * as THREE from 'three';
import { Node } from '../../models/graph/node';
import {
    ViewTemplate,
    MeshKind,
    ReactOverlay,
    enrichOverlay,
} from '../../customization';
import { preparePrimitive, prepareMesh } from '../../utils/shapeUtils';
import { Vector3d } from '../../models/structures';
import { threeVector3ToVector3d, getModelFittingBox, vector3dToTreeVector3 } from '../../utils';
import { AbstractOverlayAnchor, OverlayPosition } from './overlayAnchor';
import { View } from '../viewInterface';
import { AbstractOverlayAnchor3d, applyOffset } from './overlay3DAnchor';
import { SELECTION_PADDING } from '../widgets/selectionView';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';

export class NodeView<Descriptor extends GraphDescriptor> implements View<Node<Descriptor>> {
    public readonly model: Node<Descriptor>;
    public readonly mesh: THREE.Object3D;
    public readonly overlayAnchor: NodeOverlayAnchor<Descriptor>;
    public readonly overlayAnchor3d: NodeOverlayAnchor3d<Descriptor>;

    private boundingBox: THREE.Box3;
    private meshOriginalSize: THREE.Vector3;
    private meshOffset: Vector3d;
    private preserveRatio: boolean;

    constructor(model: Node<Descriptor>, template: ViewTemplate<Node<Descriptor>>) {
        this.model = model;
        this.boundingBox = new THREE.Box3();
        const meshDescriptor = template.mesh();

        this.preserveRatio = meshDescriptor.preserveRatio || meshDescriptor.preserveRatio === undefined;

        // todo move scale logic to a shape utils as a basic thing
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
            this.meshOffset = threeVector3ToVector3d(this.mesh.position);
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

        this.overlayAnchor3d = new NodeOverlayAnchor3d(this.model, this, this.overlayAnchor);

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
        this.overlayAnchor3d.update();
    }

    private calcScale(): Vector3d {
        const size = this.meshOriginalSize;
        const preferredSize = this.model.size;
        const scale = {
            x: preferredSize.x / size.x,
            y: preferredSize.y / size.y,
            z: preferredSize.z / size.z,
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

export class NodeOverlayAnchor<Descriptor extends GraphDescriptor> extends
AbstractOverlayAnchor<Node<Descriptor>, NodeView<Descriptor>> {
    getModelFittingBox() {
        return {
            ...this.meshModel.position,
            ...getModelFittingBox(this.meshModel.size),
        };
    }

    protected enrichOverlay(poorOverlay: ReactOverlay<Node<Descriptor>>) {
        return enrichOverlay(poorOverlay, this.meshModel);
    }
}

export class NodeOverlayAnchor3d<Descriptor extends GraphDescriptor> extends
AbstractOverlayAnchor3d<Node<Descriptor>, NodeView<Descriptor>> {
    forceUpdate() {
        this.meshModel.forceUpdate();
    }

    updatePosition() {
        this.mesh.position.copy(vector3dToTreeVector3(this.meshView.model.position));
    }

    placeSprites(renderedSprites: Rendered3dSprite[]) {
        const spritesByPositions = new Map<OverlayPosition, Rendered3dSprite[]>();
        for (const renderedSprite of renderedSprites) {
            if (!spritesByPositions.has(renderedSprite.position)) {
                spritesByPositions.set(renderedSprite.position, []);
            }
            spritesByPositions.get(renderedSprite.position).push(renderedSprite);
        }

        const initialOffset = {
            x: this.meshModel.size.x / 2 + SELECTION_PADDING,
            y: this.meshModel.size.y / 2 + SELECTION_PADDING,
            z: 0,
        };
        spritesByPositions.forEach((sprites, position) => {
            let offset = applyOffset({x: 0, y: 0, z: 0}, initialOffset, position);
            for (const renderedSprite of sprites) {
                renderedSprite.sprite.position.set(
                    offset.x,
                    offset.y,
                    offset.z,
                );
                offset = applyOffset(offset, {
                    x: SELECTION_PADDING + renderedSprite.size.x,
                    y: SELECTION_PADDING + renderedSprite.size.y,
                    z: 0,
                }, position);
            }
        });
    }
}
