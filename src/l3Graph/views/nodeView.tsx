import * as THREE from 'three';
import { createElement } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Node } from '../models/node';
import { DiagramElementView } from './diagramElementView';
import {
    NodeViewTemplate,
    DEFAULT_NODE_TEMPLATE,
    isMeshObj,
    isObject3d,
    isMeshPrimitive,
    createContextProvider,
} from '../templates';
import { getColorByTypes } from '../utils/colorUtils';

export const DEFAULT_SCALE = 20;

export class NodeView implements DiagramElementView {
    private model: Node;
    private template: NodeViewTemplate;

    private mesh: THREE.Object3D;
    private overlayObject: THREE.CSS3DSprite;
    private boundingBox: THREE.Box3;

    private meshOffset: THREE.Vector3;
    private htmlOverlay: HTMLElement;
    // private htmlSphere: HTMLElement;
    private htmlBody: HTMLElement;

    constructor(model: Node, template?: NodeViewTemplate) {
        this.model = model;
        this.template = template || DEFAULT_NODE_TEMPLATE;
        this.init();
    }

    public getMesh(): THREE.Object3D | undefined {
        return this.mesh;
    }

    public getOverlay(): THREE.CSS3DSprite | undefined {
        return this.overlayObject;
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
        if (this.overlayObject) {
            this.overlayObject.position.set(
                position.x,
                position.y,
                position.z,
            );
        }
    }

    private init = () => {
        this.boundingBox = new THREE.Box3();
        const template: NodeViewTemplate = {
            ...DEFAULT_NODE_TEMPLATE,
            ...this.template,
        };

        const mesh = template.mesh(this.model.data);
        if (template.mesh) {
            if (isObject3d(mesh)) {
                this.mesh = mesh;
            } else if (isMeshPrimitive(mesh)) {
                // this.mesh = mesh;
            } else if (isMeshObj(mesh)) {
                const obj = mesh.obj;
                const colors = mesh.colors || [];
                const loader = new THREE.OBJLoader();
                this.mesh = loader.parse(obj);
                this.mesh.scale.set(DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE);

                let counter = 0;
                const fallbackColor = colors[0] || getColorByTypes(this.model.types);
                this.mesh.traverse(child => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({color: colors[counter++] || fallbackColor});
                    }
                });
            }
            // Calc mesh offset
            this.boundingBox.setFromObject(this.mesh)
                .getCenter(this.mesh.position)
                .multiplyScalar(-1);
            this.meshOffset = this.mesh.position.clone();
        }

        const Overlay = template.overlay.get(this.model.data);
        if (Overlay) {
            const model = this.model;

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
            this.overlayObject = new THREE.CSS3DSprite(this.htmlOverlay);
        }
    }
}
