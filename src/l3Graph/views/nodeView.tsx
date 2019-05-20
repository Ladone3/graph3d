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
} from '../customisation';
import { getColorByTypes } from '../utils/colorUtils';
import { getPrimitive } from '../utils/shapeUtils';
import { Vector3D } from '../models/primitives';
import { treeVector3ToVector3D } from '../utils';

export class NodeView implements DiagramElementView<Node> {
    public readonly model: Node;
    public readonly mesh: THREE.Object3D;
    public readonly overlay: THREE.CSS3DSprite;

    private boundingBox: THREE.Box3;
    private meshOriginalSize: THREE.Vector3;
    private meshOffset: Vector3D;
    private htmlOverlay: HTMLElement;
    private htmlBody: HTMLElement;
    private texture: THREE.Texture;

    private overlayMesh: THREE.Mesh;
    private meshMesh: THREE.Mesh;

    private preserveRatio: boolean;

    constructor(model: Node, customTemplate?: NodeViewTemplate) {
        this.model = model;
        this.boundingBox = new THREE.Box3();
        const template: NodeViewTemplate = {
            ...DEFAULT_NODE_TEMPLATE,
            ...customTemplate,
        };
        const meshDescriptor = template.mesh(model.data);
        const Overlay = template.overlay.get(model.data);

        this.preserveRatio = meshDescriptor.preserveRatio || meshDescriptor.preserveRatio === undefined;

        let mesh: THREE.Mesh;
        if (meshDescriptor) {
            if (meshDescriptor.type === MeshKind.ThreeNative) {
                mesh = meshDescriptor.mesh;
            } else if (meshDescriptor.type === MeshKind.Primitive) {
                mesh = getPrimitive(meshDescriptor);
            } else if (meshDescriptor.type === MeshKind.Obj) {
                const color = meshDescriptor.color || getColorByTypes(this.model.types);
                const loader = new THREE.OBJLoader();
                mesh = loader.parse(meshDescriptor.markup) as any;

                const material = new THREE.MeshPhongMaterial({color});
                mesh.traverse(child => {
                    if (child instanceof THREE.Mesh) { child.material = material; }
                });
            }
            // Calc bounding box
            this.boundingBox.setFromObject(mesh)
                .getCenter(mesh.position)
                .multiplyScalar(-1);
            this.meshOffset = treeVector3ToVector3D(mesh.position);
            this.meshOriginalSize = this.boundingBox.getSize(mesh.position).clone();
        } else {
            mesh = null;
        }
        this.meshMesh = mesh;

        let overlay: THREE.Object3D;
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
            // overlay = new THREE.CSS3DSprite(this.htmlOverlay);

            getImage(this.htmlOverlay.innerHTML).then((dataUrl: string) => {
                this.texture = new THREE.TextureLoader().load(dataUrl);
                this.model.forceUpdate();
                const img: HTMLImageElement = document.createElement('img') as any;
                img.src = dataUrl;
                document.body.appendChild(img);
            });
            overlay = new THREE.Mesh(
                new THREE.PlaneGeometry(30, 10, 2),
                new THREE.MeshPhongMaterial({color: 'gray', side: THREE.DoubleSide}),
            );
            overlay.position.set(0, 0, 0);
        } else {
            overlay = null;
        }

        if (mesh || overlay) {
            if (mesh && overlay) {
                this.mesh = new THREE.Group();
                this.mesh.add(mesh);
                this.mesh.add(overlay);
                this.overlayMesh = overlay as any;
            } else if (mesh) {
                this.mesh = mesh;
            } else {
                this.mesh = overlay;
                this.overlayMesh = overlay as any;
            }
        }
        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const position = this.model.position;

        if (this.meshMesh) {
            // Calc scale
            const scale = this.calcScale();
            this.meshMesh.scale.set(scale.x, scale.y, scale.z);
            // Calc bounding box
            this.boundingBox.setFromObject(this.meshMesh)
                .getCenter(this.meshMesh.position)
                .multiplyScalar(-1);

            this.meshMesh.position.set(
                position.x + this.meshOffset.x * scale.x,
                position.y + this.meshOffset.y * scale.y,
                position.z + this.meshOffset.z * scale.z,
            );
        }

        // Update overlay
        if (this.overlayMesh && this.texture) {
            this.overlayMesh.position.set(
                position.x + 10,
                position.y + 10,
                position.z + 10,
            );
            this.overlayMesh.material = new THREE.MeshBasicMaterial({
                map: this.texture,
                side: THREE.DoubleSide,
                color: 'white',
            });
            this.overlayMesh.material.needsUpdate = true;
            // .side = THREE.DoubleSide
        }
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

function getImage(html: string): Promise<string> {
    return fetch('/convertToImage', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'text/plain',
        },
        mode: 'cors',
        cache: 'default',
        body: html,
    }).then(function (response) {
        if (response.ok) {
            return response.text(); // Also possible to use: response.text(); //response.type;
        } else {
            const error = new Error(response.statusText);
            throw error;
        }
    });
}
