// import * as THREE from 'three';
// import { createElement } from 'react';
// import * as ReactDOM from 'react-dom';
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
// import { Point } from '../models/point';

// export class Overlay3dView implements DiagramElementView<Point> {
//     public readonly model: Point;
//     public readonly mesh: THREE.Object3D;
//     public readonly overlay: THREE.CSS3DSprite;

//     constructor(
//         model: Point,
//         private htmlOverlay: HTMLElement,
//     ) {
//         this.model = model;
//         const geometry = new THREE.PlaneGeometry(10, 10, 2);


//         this.update();
//     }

//     public getBoundingBox(): THREE.Box3 {
//         return new THREE.Box3();
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
