import * as THREE from 'three';
import { createElement } from 'react';
import * as ReactDOM from 'react-dom';
import { Node } from '../models/node';
import { DiagramElementView } from './diagramElementView';
import {
    NodeViewTemplate,
    DEFAULT_NODE_TEMPLATE,
    createContextProvider,
    MeshKind,
    L3Mesh,
    DEFAULT_NODE_SIZE,
} from '../templates';
import { getColorByTypes } from '../utils/colorUtils';
import { getPrimitive } from '../utils/shapeUtils';
import { Vector3D } from '../models/primitives';

export class NodeView implements DiagramElementView<Node> {
    public readonly model: Node;
    public readonly mesh: THREE.Object3D;
    public readonly overlay: THREE.CSS3DSprite;

    private boundingBox: THREE.Box3;
    private meshOffset: THREE.Vector3;
    private htmlOverlay: HTMLElement;
    private htmlBody: HTMLElement;

    constructor(model: Node, customTemplate?: NodeViewTemplate) {
        this.model = model;
        this.boundingBox = new THREE.Box3();
        const template: NodeViewTemplate = {
            ...DEFAULT_NODE_TEMPLATE,
            ...customTemplate,
        };
        const meshDescription = template.mesh(model.data);
        const Overlay = template.overlay.get(model.data);

        if (meshDescription) {
            if (meshDescription.type === MeshKind.ThreeNative) {
                this.mesh = meshDescription.mesh;
            } else if (meshDescription.type === MeshKind.Primitive) {
                this.mesh = getPrimitive(meshDescription);
            } else if (meshDescription.type === MeshKind.Obj) {
                const colors = meshDescription.colors || [];
                const loader = new THREE.OBJLoader();
                this.mesh = loader.parse(meshDescription.markup);

                let counter = 0;
                const fallbackColor = colors[0] || getColorByTypes(this.model.types);
                this.mesh.traverse(child => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({color: colors[counter++] || fallbackColor});
                    }
                });
            }
            // Calc scale
            const scale = this.calcScale(meshDescription);
            this.mesh.scale.set(scale.x, scale.y, scale.z);
            // Calc bounding box
            this.boundingBox.setFromObject(this.mesh)
                .getCenter(this.mesh.position)
                .multiplyScalar(-1);
            // Calc mesh offset
            this.meshOffset = this.mesh.position.clone();
        } else {
            this.mesh = null;
        }

        if (Overlay) {
            this.htmlOverlay = document.createElement('DIV');
            this.htmlOverlay.className = 'o3d-node-html-container';

            this.htmlBody = document.createElement('DIV');
            this.htmlBody.className = 'o3d-node-html-view';
            this.htmlOverlay.appendChild(this.htmlBody);

            if (template.overlay.context) {
                const Context = createContextProvider(template.overlay.context);
                ReactDOM.render(createElement(Context, null,
                    createElement(Overlay, model.data),
                ), this.htmlBody);
            } else {
                ReactDOM.render(createElement(Overlay, model.data), this.htmlBody);
            }
            this.overlay = new THREE.CSS3DSprite(this.htmlOverlay);
        } else {
            this.overlay = null;
        }
        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const position = this.model.position;

        // Update mesh
        if (this.mesh) {
            this.mesh.position.set(
                position.x + this.meshOffset.x,
                position.y + this.meshOffset.y,
                position.z + this.meshOffset.z,
            );
        }

        // Update overlay
        if (this.overlay) {
            this.overlay.position.set(
                position.x,
                position.y,
                position.z,
            );
        }
    }

    private calcScale(meshTemplate: L3Mesh): Vector3D {
        // Calc bounding box
        this.boundingBox.setFromObject(this.mesh)
            .getCenter(this.mesh.position)
            .multiplyScalar(-1);
        // Calc mesh offset
        this.meshOffset = this.mesh.position.clone();

        const size = this.boundingBox.getSize();
        const maxSize = meshTemplate.size || DEFAULT_NODE_SIZE;
        if (typeof maxSize === 'number') {
            const scaleX = maxSize / size.x;
            const scaleY = maxSize / size.x;
            const scaleZ = maxSize / size.x;
            const minScale = Math.min(scaleX, scaleY, scaleZ);
            return {
                x: minScale,
                y: minScale,
                z: minScale,
            };
        } else {
            return {
                x: maxSize.x / size.x,
                y: maxSize.y / size.y,
                z: maxSize.z / size.z,
            };
        }
    }
}
