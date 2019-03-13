import { Vector3d } from '../models/structures';
export declare enum MeshKind {
    Obj = "obj",
    Primitive = "primitive",
    ThreeNative = "three-native"
}
export declare namespace THREE {
    type Object3D = any;
}
export interface Mesh {
    color?: string | number;
    texture?: string;
    preserveRatio?: boolean;
    size?: Vector3d;
}
export interface MeshNative extends Mesh {
    type: MeshKind.ThreeNative;
    mesh: THREE.Object3D;
}
export interface MeshObj extends Mesh {
    type: MeshKind.Obj;
    markup: string;
}
export interface MeshPrimitive extends Mesh {
    type: MeshKind.Primitive;
    shape: 'cube' | 'sphere' | 'cone' | 'cylinder' | 'dodecahedron' | 'torus' | 'tetrahedron' | 'plane';
}
export declare type L3Mesh = MeshNative | MeshObj | MeshPrimitive;
