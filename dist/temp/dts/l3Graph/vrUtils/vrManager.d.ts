import Subscribable from '../utils/subscribable';
import { DiagramView } from '../views/diagramView';
export interface VrManagerEvents {
    'connection:state:changed': void;
}
export declare class VrManager extends Subscribable<VrManagerEvents> {
    private view;
    private _isConnected;
    private _session;
    constructor(view: DiagramView);
    readonly camera: import("three").Camera;
    readonly isConnected: boolean;
    disconnect(): void;
    connect(): Promise<unknown>;
    getController(id: number): import("three").Group;
    private checkIfSupported;
}
