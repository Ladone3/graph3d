import * as React from 'react';
import * as _THREE from 'three';

export * from './defaultLinkTemplate';
export * from './defaultNodeTemplate';
export * from './defaultOverlay';

export interface MeshObj {
    obj: string;
    colors?: (string | number)[];
}

export namespace THREE {
    export type Object3D = any;
}

export type MeshPrimitive = 'cube' |
                            'sphere' |
                            'cone' |
                            'cilinder' |
                            'dodecahedron' |
                            'tube' |
                            'torus' |
                            'tetrahedron' |
                            'plane';

export type L3Mesh = THREE.Object3D | MeshObj | MeshPrimitive;

// ====

export function isMeshObj(mesh: L3Mesh): mesh is MeshObj {
    return mesh.obj && typeof mesh.obj === 'string';
}

export function isObject3d(mesh: L3Mesh): mesh is _THREE.Object3D {
    return mesh instanceof _THREE.Object3D;
}

export function isMeshPrimitive(mesh: L3Mesh): mesh is MeshPrimitive {
    return typeof mesh === 'string' && [
        'cube',
        'sphere',
        'cone',
        'cilinder',
        'dodecahedron',
        'tube',
        'torus',
        'tetrahedron',
        'plane',
    ].indexOf(mesh) !== -1;
}

export interface NodeViewTemplate<NodeContent = any> {
    overlay?: {
        get: (node: NodeContent) => React.ComponentClass<NodeContent>;
        context?: any;
    };
    mesh?: (data: NodeContent) => L3Mesh;
}

export type TemplateProvider = (types: string[]) => NodeViewTemplate;

export interface LinkViewTemplate {
    color: number | string;
}
