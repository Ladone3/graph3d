export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface Vector2D {
    x: number;
    y: number;
}

export interface Rectangle extends Vector2D {
    width: number;
    height: number;
}

export interface Box extends Vector3D {
    width: number;
    height: number;
    deep: number;
}

export enum Object3dKind {
    Mesh = 'mesh',
    Line = 'line',
}

export type Polygon3d = [Vector3D, Vector3D, Vector3D];
export interface Mesh {
    type: Object3dKind.Mesh;
    polygons: Polygon3d[];
}

export interface Line {
    type: Object3dKind.Line;
    points: Vector3D[];
}
