import * as THREE from 'three';
export interface UndocumentedOptions {
    frameOfReferenceType: any;
}
export interface WebGLRenderer extends THREE.WebGLRenderer {
    vr: ThreejsVrManager;
}
export interface ThreejsVrManager extends THREE.WebVRManager {
    setSession: (session: Session) => void;
    getController: (index: number) => THREE.Group;
    scaleFactor: number;
}
export declare type Device = VRDisplay & {
    isPresenting: boolean;
    exitPresent: () => void;
    requestPresent: (presenters: {
        source: HTMLCanvasElement;
    }[]) => void;
    requestSession: (options: {
        immersive: boolean;
        exclusive: boolean;
    }) => Promise<Session>;
    supportsSession: (options: {
        immersive: boolean;
        exclusive: boolean;
    }) => Promise<void>;
};
export interface VrEvent extends Event {
    display: Device;
}
export interface Session {
    addEventListener: (eventId: string, handler: (event: Event) => void) => void;
    removeEventListener: (eventId: string, handler: (event: Event) => void) => void;
    end: () => void;
}
export interface XrNavigator extends Navigator {
    xr: {
        requestDevice: () => Promise<Device>;
    };
}
export interface CompleteNavigator extends Navigator {
    webkitGetGamepads: () => Gamepad[];
}
export declare function isXrNavigator(n: Navigator): n is XrNavigator;
export declare function isWebkitNavigator(n: Navigator): n is CompleteNavigator;
