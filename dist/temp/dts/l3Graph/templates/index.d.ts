/// <reference types="react" />
import * as React from 'react';
import * as _THREE from 'three';
export * from './defaultLinkTemplate';
export * from './defaultNodeTemplate';
export * from './defaultOverlay';
export interface MeshObj {
    obj: string;
    scale?: number;
    colors?: (string | number)[];
}
export declare namespace THREE {
    type Object3D = any;
}
export interface MeshPrimitive {
    shape: 'cube' | 'sphere' | 'cone' | 'cylinder' | 'dodecahedron' | 'torus' | 'tetrahedron' | 'plane';
    color?: string;
}
export declare type L3Mesh = THREE.Object3D | MeshObj | MeshPrimitive;
export declare function isMeshObj(mesh: L3Mesh): mesh is MeshObj;
export declare function isObject3d(mesh: L3Mesh): mesh is _THREE.Object3D;
export declare function isMeshPrimitive(mesh: L3Mesh): mesh is MeshPrimitive;
export interface NodeViewTemplate<NodeContent = any> {
    overlay?: {
        get: (node: NodeContent) => React.ComponentClass<NodeContent>;
        context?: any;
    };
    mesh?: (data: NodeContent) => L3Mesh;
}
export declare type NodeTemplateProvider = (types: string[]) => NodeViewTemplate;
export interface LinkViewTemplate {
    color: number | string;
    thickness?: number;
}
export declare type LinkTemplateProvider = (types: string[]) => LinkViewTemplate;
