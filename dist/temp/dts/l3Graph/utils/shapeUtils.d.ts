import * as THREE from 'three';
import { MeshPrimitive, MeshObj } from '../customisation';
export declare function preparePrimitive(primitive: MeshPrimitive): THREE.Mesh;
export declare function prepareMesh(meshObj: MeshObj): THREE.Group;
/** Helper only for phong and line basic material */
export declare function setColor(mesh: THREE.Object3D, providedColor: string | number | Map<THREE.Object3D, string | number>): void;
export declare function backupColors(mesh: THREE.Object3D): Map<THREE.Object3D, THREE.Material>;
export declare function restoreColors(mesh: THREE.Object3D, backUp: Map<THREE.Object3D, THREE.Material>): void;
