import * as THREE from 'three';
import Subscribable from '../utils/subscribeable';
import { DiagramView } from '../views/diagramView';
export interface VrManagerEvents {
    'presenting:state:changed': void;
    'connection:state:changed': void;
}
export declare class VrManager extends Subscribable<VrManagerEvents> {
    private view;
    private device?;
    private session?;
    private _isStarted;
    private errorMessages;
    private isXr;
    constructor(view: DiagramView);
    readonly errors: string[];
    readonly isStarted: boolean;
    readonly isConnected: boolean;
    readonly camera: THREE.PerspectiveCamera | THREE.ArrayCamera;
    getController(id: number): THREE.Group;
    start(): void;
    stop(): void;
    connect(): Promise<void>;
    private _initVr;
    private animationLoop;
    private _cancelVr;
    private setError;
    private setDevice;
}
