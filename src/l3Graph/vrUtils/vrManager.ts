import Subscribable from '../utils/subscribable';
import { DiagramView } from '../views/diagramView';
import { Device, Session, isXrNavigator, VrEvent, hasVrDisplays, XrNavigator } from './webVr';

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

const VR_UNSUPPORTED_ERROR = 'Vr mode is not supported!';

export type RMode = XrMode | VrMode | UnsupportedMode;

export class VrManager extends Subscribable<VrManagerEvents> {
    private device?: Device;
    private session?: Session; // only for XR mode
    private connectionPromise?: Promise<RMode>;

    private _isStarted: boolean;

    constructor(
        private view: DiagramView<any>,
    ) {
        super();
        this.connectionPromise = this._connect();
        this.listenToEvents();
    }

    get isStarted() {
        return this._isStarted;
    }

    get isConnected() {
        return Boolean(this.device);
    }

    get camera() {
        return this.view.renderer.vr.getCamera(this.view.camera);
    }

    connect() {
        if (this.isConnected) {
            return Promise.resolve();
        } else {
            if (!this.connectionPromise) {
                this.connectionPromise = this._connect();
            }
            return this.connectionPromise.then(rMode => {
                this.connectionPromise = null;
                if (rMode.type === 'xr') {
                    const sessionInit = {optionalFeatures: ['local-floor', 'bounded-floor']};
                    return (navigator as XrNavigator).xr.requestSession('immersive-vr', sessionInit).then(session => {
                        this.session = session;
                        return;
                    });
                } else if (rMode.type === 'vr') {
                    this.device = rMode.device;
                    return;
                } else {
                    throw rMode.error;
                }
            });
        }
    }

    getController(id: number) {
        return this.view.renderer.vr.getController(id);
    }

    start() {
        if (this.isStarted) { return; }
        this.view.renderer.vr.enabled = true;
        this.view.renderer.setAnimationLoop(this.animationLoop);
        const vr = this.view.renderer.vr;
        vr.setFramebufferScaleFactor(0.8);
        if (this.session) {
            const onSessionEnded = (event: Event) => {
                this.session.removeEventListener('end', onSessionEnded);
                vr.setSession(null);
                this.session = null;
            };
            this.session.addEventListener('end', onSessionEnded);
            vr.setSession(this.session);
        } else {
            this.device.requestPresent([{source: this.view.renderer.domElement}]);
        }

        this._isStarted = true;
    }

    stop() {
        if (!this.isStarted) { return; }

        if (this.session) {
            this.session.end();
        } else {
            this.device.exitPresent();
        }
    }

    private _connect(): Promise<RMode> {
        if (isXrNavigator(navigator)) {
            return navigator.xr.isSessionSupported('immersive-vr')
                .then(supported => {
                    if (supported) {
                        return { type: 'xr' };
                    } else {
                        return { type: 'unsupported', error: new Error(VR_UNSUPPORTED_ERROR) };
                    }
                });
        } else if (hasVrDisplays(navigator)) {
            return new Promise((resolve, reject) => {
                navigator.getVRDisplays().then(displays => {
                    if (displays.length > 0) {
                        resolve({ type: 'vr', device: displays[0] as Device});
                    } else {
                        resolve({ type: 'unsupported', error: new Error(`${VR_UNSUPPORTED_ERROR}. No VR displays.`) });
                    }
                }).catch(e => ({ type: 'unsupported', error: e}));
            });
        } else {
            return Promise.resolve({
                type: 'unsupported',
                error: new Error(`${VR_UNSUPPORTED_ERROR}. Neither xr no VR modes are supported by navigator.`),
            });
        }
    }

    private listenToEvents() {
        if (hasVrDisplays(navigator)) {
            window.addEventListener('vrdisplayconnect', event => {
                this.setDevice((event as VrEvent).display);
            }, false);

            window.addEventListener('vrdisplaydisconnect', event => {
                this.stop();
                this.setDevice(null);
            }, false);

            window.addEventListener('vrdisplayactivate', event => {
                this.start();
            }, false);

            window.addEventListener('vrdisplaypresentchange', event => {
                const vrEvent = event as VrEvent;
                this._isStarted = vrEvent.display.isPresenting;
                if (!this._isStarted) {
                    this._cancelVr();
                }
                this.trigger('presenting:state:changed');
            }, false );
        }
    }

    private animationLoop = () => {
        this.view.renderer.render(this.view.scene, this.view.camera);
    }

    private _cancelVr() {
        // this.view.renderer.xr.enabled = false;
        this.view.renderer.vr.enabled = false;
        this.view.renderer.setAnimationLoop(this.animationLoop);
    }

    private setDevice(device: Device) {
        this.device = device;
        this.view.renderer.vr.setDevice(this.device);
        this.trigger('connection:state:changed');
    }
}
