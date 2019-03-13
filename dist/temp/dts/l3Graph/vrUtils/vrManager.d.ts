import Subscribable from '../utils/subscribable';
import { DiagramView } from '../views/diagramView';
import { Device } from './webVr';
export interface VrManagerEvents {
    'presenting:state:changed': void;
    'connection:state:changed': void;
}
export interface UnsupportedMode {
    type: 'unsupported';
    error: any;
}
export interface XrMode {
    type: 'xr';
}
export interface VrMode {
    type: 'vr';
    device: Device;
}
export declare type RMode = XrMode | VrMode | UnsupportedMode;
export declare class VrManager extends Subscribable<VrManagerEvents> {
    private view;
    private device?;
    private session?;
    private connectionPromise?;
    private _isStarted;
    constructor(view: DiagramView<any>);
    readonly isStarted: boolean;
    readonly isConnected: boolean;
    readonly camera: import("three").PerspectiveCamera | import("three").ArrayCamera;
    connect(): Promise<void>;
    getController(id: number): import("three").Group;
    start(): void;
    stop(): void;
    private _connect;
    private listenToEvents;
    private animationLoop;
    private _cancelVr;
    private setDevice;
}
