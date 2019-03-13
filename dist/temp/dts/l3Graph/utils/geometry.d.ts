import * as THREE from 'three';
import { Vector3d, Vector2d } from '../models/structures';
import { Size } from '../models/graph/node';
export declare function vector3dToTreeVector3(v: Vector3d): THREE.Vector3;
export declare function threeVector3ToVector3d(v: THREE.Vector3): Vector3d;
export declare function calcBounds(points: Vector3d[]): {
    min: Vector3d;
    max: Vector3d;
    average: Vector3d;
};
export declare function normalize(vector: Vector3d): Vector3d;
export declare function length(from: Vector3d | Vector2d): number;
export declare function vectorLength({ x, y, z }: Vector3d): number;
export declare function distance(from: Vector3d | Vector2d, to: Vector3d | Vector2d): number;
export declare function inverse(vector: Vector3d): Vector3d;
export declare function multiply(vector: Vector3d, k: number): Vector3d;
export declare function sum(vector1: Vector3d, vector2: Vector3d): Vector3d;
export declare function sub(vector1: Vector3d, vector2: Vector3d): Vector3d;
export declare function normalLeft(vector: Vector3d): {
    x: number;
    y: number;
    z: number;
};
export declare function normalUp(vector: Vector3d): Vector3d;
export declare function normalDown(vector: Vector3d): Vector3d;
export declare function normalRight(vector: Vector3d): Vector3d;
export declare function eventToPosition(event: MouseEvent | TouchEvent, viewBox?: ClientRect | DOMRect): Vector2d | undefined;
export declare function getModelFittingBox({ x, y, z }: Size): {
    width: number;
    height: number;
    deep: number;
};
