import Subscribable from '../utils/subscribable';
import { DiagramView } from '../views/diagramView';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export interface VrManagerEvents {
    'presenting:state:changed': void;
    'connection:state:changed': void;
}
export declare class VrManager<Descriptor extends GraphDescriptor> extends Subscribable<VrManagerEvents> {
    private view;
    private device?;
    private session?;
    private _isStarted;
    private errorMessages;
    private isXr;
    constructor(view: DiagramView<Descriptor>);
    readonly errors: string[];
    readonly isStarted: boolean;
    readonly isConnected: boolean;
    readonly camera: import("three").PerspectiveCamera | import("three").ArrayCamera;
    getController(id: number): import("three").Group;
    start(): void;
    stop(): void;
    connect(): Promise<void>;
    private _initVr;
    private animationLoop;
    private _cancelVr;
    private setError;
    private setDevice;
}
