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
import { threeVector3ToVector3D, getModelFittingBox, vector3DToTreeVector3 as vector3DToThreeVector3, sum } from '../../utils';
import { AbstractOverlayAnchor, OverlayPosition } from './overlayAnchor';
import { DiagramElementView } from '../viewInterface';
import { AbstracrOverlayAnchor3d } from './overlay3DAnchor';
import { SELECTION_PADDING } from '../widgets/selectionView';
import { Rendered3dSprite } from '../../utils/htmlToSprite';

export class NodeView implements DiagramElementView {
    public readonly model: Node;
    public readonly mesh: THREE.Object3D;
    public readonly overlayAnchor: NodeOverlayAnchor;
    public readonly overlayAnchor3d: NodeOverlayAnchor3d;

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
            this.meshOffset = threeVector3ToVector3D(this.mesh.position);
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

export class NodeOverlayAnchor3d extends AbstracrOverlayAnchor3d<Node, NodeView> {
    forceUpdate() {
        this.meshModel.forceUpdate();
    }

    updatePosition() {
        this.mesh.position.copy(vector3DToThreeVector3(this.meshView.model.position));
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
                )
                offset = applyOffset(offset, {
                    x: SELECTION_PADDING + renderedSprite.size.x,
                    y: SELECTION_PADDING + renderedSprite.size.y,
                    z: 0,
                }, position);
            }
        });
    }
}

function applyOffset(
    basicVector: Vector3D,
    offset: Vector3D,
    position: OverlayPosition,
): Vector3D {
    const {x: xOffset, y: yOffset} = offset;
    let offsetByPossition: Vector3D;
    switch(position) {
        case 'e': offsetByPossition = {x: xOffset,  y: 0, z: 0}; break;
        case 'w': offsetByPossition = {x: -xOffset, y: 0, z: 0}; break;
        case 'n': offsetByPossition = {x: 0, y: -yOffset, z: 0}; break;
        case 's': offsetByPossition = {x: 0, y: yOffset, z: 0}; break;
        case 'ne': offsetByPossition = {x: xOffset,  y: -yOffset, z: 0}; break;
        case 'se': offsetByPossition = {x: xOffset,  y: yOffset, z: 0}; break;
        case 'nw': offsetByPossition = {x: -xOffset,  y: -yOffset, z: 0}; break;
        case 'sw': offsetByPossition = {x: -xOffset,  y: yOffset, z: 0}; break;
        default: offsetByPossition = {x: 0, y: 0, z: 0};
    }
    return sum(basicVector, offsetByPossition);
}