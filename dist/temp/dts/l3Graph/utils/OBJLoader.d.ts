import * as THREE from 'three';
declare type Group = THREE.Group & {
    materialLibraries?: any[];
};
export declare class OBJLoader {
    private manager?;
    private materials;
    private path;
    constructor(manager?: THREE.LoadingManager);
    load(url: string, onLoad: (result: any) => void, onProgress: (progress: ProgressEvent<EventTarget>) => void, onError: (error: ErrorEvent) => void): void;
    setPath(value: string): this;
    setMaterials(materials: any): this;
    parse(text: string): Group;
}
export {};
