import Subscribable from '../utils/subscribable';
import { DiagramView } from '../views/diagramView';
import { isXrNavigator, XrNavigator, Session } from './webVr';
import { Core } from '../core';

export interface VrManagerEvents {
    'connection:state:changed': void;
}

export class VrManager extends Subscribable<VrManagerEvents> {
    private _isConnected: boolean;
    private _session: Session | undefined;

    constructor(private core: Core) {
        super();
    }

    get camera() {
        return this.core.renderer.xr.getCamera(this.core.camera);
    }

    get isConnected() {
        return this._isConnected;
    }

    disconnect() {
        if (this._session) {
            this._session.end();
        }
    }

    connect() {
        return this.checkIfSupported().then(supported => {
            return new Promise((resolve, reject) => {
                if (supported) {
                    const sessionInit = {optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']};
                    return (navigator as XrNavigator).xr.requestSession('immersive-vr', sessionInit).then(session => {
                        const xr = this.core.renderer.xr;

                        const onSessionEnded = (event: Event) => {
                            session.removeEventListener('end', onSessionEnded);
                            this._isConnected = false;
                            resolve();
                            this.trigger('connection:state:changed');
                        };

                        session.addEventListener('end', onSessionEnded);
                        // xr.setFramebufferScaleFactor(1);
                        xr.setSession(session);

                        this._session = session;
                        this._isConnected = true;
                        this.trigger('connection:state:changed');
                    });
                } else {
                    reject(new Error('Vr mode is not supported! Neither xr no VR modes are supported by navigator.'));
                }
            });
        });
    }

    getController(id: number) {
        return this.core.renderer.xr.getController(id);
    }

    private checkIfSupported(): Promise<boolean> {
        if (isXrNavigator(navigator)) {
            return navigator.xr.isSessionSupported('immersive-vr');
        } else {
            return Promise.resolve(false);
        }
    }
}
