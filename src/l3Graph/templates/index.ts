import * as React from 'react';
import * as _THREE from 'three';
import { Vector3D } from '../models/primitives';

export * from './defaultLinkTemplate';
export * from './defaultNodeTemplate';
export * from './defaultOverlay';
export const DEFAULT_NODE_SIZE = 15;

export enum MeshKind {
    Obj = 'obj',
    Primitive = 'primitive',
    ThreeNative = 'three-native',
}

export namespace THREE {
    export type Object3D = any;
}

export interface MeshNative {
    type: MeshKind.ThreeNative;
    mesh: THREE.Object3D;
    size?: number | Vector3D;
    colors?: (string | number)[];
    texture?: string;
}

export interface MeshObj {
    type: MeshKind.Obj;
    markup: string;
    size?: number | Vector3D;
    colors?: (string | number)[];
    texture?: string;
}

export interface MeshPrimitive {
    type: MeshKind.Primitive;
    shape: 'cube' |
           'sphere' |
           'cone' |
           'cylinder' |
           'dodecahedron' |
           'torus' |
           'tetrahedron' |
           'plane';
    size?: number | Vector3D;
    colors?: (string | number)[];
    texture?: string;
}

export type L3Mesh = MeshNative | MeshObj | MeshPrimitive;

export interface NodeViewTemplate<NodeContent = any> {
    overlay?: {
        get: (node: NodeContent) => React.ComponentClass<NodeContent>;
        context?: any;
    };
    mesh?: (data: NodeContent) => L3Mesh;
}

export type NodeTemplateProvider = (types: string[]) => NodeViewTemplate;

export interface LinkViewTemplate {
    color: number | string;
    thickness?: number;
}

export type LinkTemplateProvider = (types: string[]) => LinkViewTemplate;
