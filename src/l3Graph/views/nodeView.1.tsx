// import * as THREE from 'three';
// import { createElement } from 'react';
// import * as ReactDOM from 'react-dom';
// import { Node } from '../models/node';
// import { DiagramElementView } from './diagramElementView';
// import {
//     NodeViewTemplate,
//     DEFAULT_NODE_TEMPLATE,
//     createContextProvider,
//     MeshKind,
// } from '../customisation';
// import { getColorByTypes } from '../utils/colorUtils';
// import { getPrimitive } from '../utils/shapeUtils';
// import { Vector3D } from '../models/primitives';
// import { treeVector3ToVector3D } from '../utils';

// export class NodeView implements DiagramElementView<Node> {
//     public readonly model: Node;
//     public readonly mesh: THREE.Object3D;
//     public readonly overlay: THREE.CSS3DSprite;

//     private boundingBox: THREE.Box3;
//     private meshOriginalSize: THREE.Vector3;
//     private meshOffset: Vector3D;
//     private htmlOverlay: HTMLElement;
//     private htmlBody: HTMLElement;

//     private preserveRatio: boolean;

//     constructor(model: Node, customTemplate?: NodeViewTemplate) {
//         this.model = model;
//         this.boundingBox = new THREE.Box3();
//         const template: NodeViewTemplate = {
//             ...DEFAULT_NODE_TEMPLATE,
//             ...customTemplate,
//         };
//         const meshDescriptor = template.mesh(model.data);
//         const Overlay = template.overlay.get(model.data);

//         this.preserveRatio = meshDescriptor.preserveRatio || meshDescriptor.preserveRatio === undefined;

//         if (meshDescriptor) {
//             if (meshDescriptor.type === MeshKind.ThreeNative) {
//                 this.mesh = meshDescriptor.mesh;
//             } else if (meshDescriptor.type === MeshKind.Primitive) {
//                 this.mesh = getPrimitive(meshDescriptor);
//             } else if (meshDescriptor.type === MeshKind.Obj) {
//                 const color = meshDescriptor.color || getColorByTypes(this.model.types);
//                 const loader = new THREE.OBJLoader();
//                 this.mesh = loader.parse(meshDescriptor.markup);

//                 const material = new THREE.MeshPhongMaterial({color});
//                 this.mesh.traverse(child => {
//                     if (child instanceof THREE.Mesh) { child.material = material; }
//                 });
//             }
//             // Calc bounding box
//             this.boundingBox.setFromObject(this.mesh)
//                 .getCenter(this.mesh.position)
//                 .multiplyScalar(-1);
//             this.meshOffset = treeVector3ToVector3D(this.mesh.position);
//             this.meshOriginalSize = this.boundingBox.getSize(this.mesh.position).clone();
//         } else {
//             this.mesh = null;
//         }

//         if (Overlay) {
//             this.htmlOverlay = document.createElement('DIV');
//             this.htmlOverlay.className = 'o3d-node-html-container';

//             this.htmlBody = document.createElement('DIV');
//             this.htmlBody.className = 'o3d-node-html-view';
//             this.htmlOverlay.appendChild(this.htmlBody);

//             if (template.overlay.context) {
//                 const Context = createContextProvider(template.overlay.context);
//                 ReactDOM.render(createElement(Context, null,
//                     createElement(Overlay, model.data),
//                 ), this.htmlBody);
//             } else {
//                 ReactDOM.render(createElement(Overlay, model.data), this.htmlBody);
//             }
//             this.overlay = new THREE.CSS3DSprite(this.htmlOverlay);
//         } else {
//             this.overlay = null;
//         }
//         this.update();
//     }

//     public getBoundingBox(): THREE.Box3 {
//         return this.boundingBox;
//     }

//     public update() {
//         const position = this.model.position;

//         if (this.mesh) {
//             // Calc scale
//             const scale = this.calcScale();
//             this.mesh.scale.set(scale.x, scale.y, scale.z);
//             // Calc bounding box
//             this.boundingBox.setFromObject(this.mesh)
//                 .getCenter(this.mesh.position)
//                 .multiplyScalar(-1);

//             this.mesh.position.set(
//                 position.x + this.meshOffset.x * scale.x,
//                 position.y + this.meshOffset.y * scale.y,
//                 position.z + this.meshOffset.z * scale.z,
//             );
//         }

//         // Update overlay
//         if (this.overlay) {
//             this.overlay.position.set(
//                 position.x,
//                 position.y,
//                 position.z,
//             );
//         }
//     }

//     private calcScale(): Vector3D {
//         const size = this.meshOriginalSize;
//         const prefferedSize = this.model.size;
//         const scale = {
//             x: prefferedSize.x / size.x,
//             y: prefferedSize.y / size.y,
//             z: prefferedSize.z / size.z,
//         };
//         if (this.preserveRatio) {
//             const singleScale = Math.min(scale.x, scale.y, scale.z);
//             return {
//                 x: singleScale,
//                 y: singleScale,
//                 z: singleScale,
//             };
//         } else {
//             return scale;
//         }
//     }
// }
