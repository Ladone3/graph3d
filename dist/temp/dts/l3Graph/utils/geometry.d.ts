import * as THREE from 'three';
import { Vector3D, Vector2D } from '../models/primitives';
export declare function vector3DToTreeVector3(v: Vector3D): THREE.Vector3;
export declare function treeVector3ToVector3D(v: THREE.Vector3): Vector3D;
export declare function handleDragging(downEvent: MouseEvent, onChange: (event: MouseEvent, change: Vector2D) => void, onEnd?: (event: MouseEvent, change: Vector2D) => void): void;
export declare function createUUID(): string;
export declare function isTypesEqual(types1: string[], types2: string[]): boolean;
export declare function calcBounds(points: Vector3D[]): {
    min: Vector3D;
    max: Vector3D;
    average: Vector3D;
};
export declare function normalize(vector: Vector3D): Vector3D;
export declare function distance(from: Vector3D, to: Vector3D): number;
export declare function inverse(vector: Vector3D): Vector3D;
export declare function multiply(vector: Vector3D, k: number): Vector3D;
export declare function sum(vector1: Vector3D, vector2: Vector3D): Vector3D;
export declare function sub(vector1: Vector3D, vector2: Vector3D): Vector3D;
export declare function normalLeft(vector: Vector3D): {
    x: number;
    y: number;
    z: number;
};
export declare function normalUp(vector: Vector3D): {
    x: number;
    y: number;
    z: number;
};
export declare function normalDown(vector: Vector3D): Vector3D;
export declare function normalRight(vector: Vector3D): Vector3D;
