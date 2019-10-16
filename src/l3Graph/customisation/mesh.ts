import * as _THREE from 'three';
import { Vector3D } from '../models/structures';

export enum MeshKind {
    Obj = 'obj',
    Primitive = 'primitive',
    ThreeNative = 'three-native',
}

export namespace THREE {
    export type Object3D = any;
}

export interface Mesh {
    color?: string | number;
    texture?: string;
    preserveRatio?: boolean;
    size?: Vector3D;
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

export type L3Mesh = MeshNative | MeshObj | MeshPrimitive;
