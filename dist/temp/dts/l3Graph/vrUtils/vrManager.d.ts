import Subscribable from '../utils/subscribable';
import { Core } from '../core';
export interface VrManagerEvents {
    'connection:state:changed': void;
}
export declare class VrManager extends Subscribable<VrManagerEvents> {
    private core;
    private _isConnected;
    private _session;
    constructor(core: Core);
    readonly camera: import("three").Camera;
    readonly isConnected: boolean;
    disconnect(): void;
    connect(): Promise<unknown>;
    getController(id: number): import("three").Group;
    private checkIfSupported;
}
