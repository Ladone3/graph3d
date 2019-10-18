import Subscribable from '../utils/subscribeable';
import { DiagramView } from '../views/diagramView';
import { Device, Session, isXrNavigator, VrEvent, isWebkitNavigator } from './webVr';

export interface VrManagerEvents {
	'presenting:state:changed': void;
	'connection:state:changed': void;
}

export class VrManager extends Subscribable<VrManagerEvents> {
	private device?: Device;
	private session?: Session; // only for XR mode

	private _isStarted: boolean;
	private errorMessages: string[] = [];

	private isXr: boolean;
	private _isCanceled: boolean = false;

	constructor(
		private view: DiagramView,
	) {
		super();
	}

	get errors() {
		return this.errorMessages;
	}

	get isStarted() {
		return this._isStarted;
	}

	get isConnected() {
		return Boolean(this.device);
	}

	start() {
		if (this.isStarted) return;
		this._initVr();
		this._isCanceled = false;

		const vr = this.view.renderer.vr;
		if (this.isXr) {
			const onSessionStarted = (session: Session) => {
				this.session.addEventListener('end', onSessionEnded);
				vr.setSession(session);
			}
	
			const onSessionEnded = (event: Event) => {
				this.session.removeEventListener( 'end', onSessionEnded );
				vr.setSession(null);
				this.session = null;
			}
			this.device.requestSession({immersive: true, exclusive: true}).then(onSessionStarted);
		} else {
			this.device.requestPresent([{source: this.view.renderer.domElement}]);
		}

		this._isStarted = true;
	}

	stop() {
		if (!this.isStarted) return;
		this._cancelVr();

		if (this.isXr) {
			this.session.end();
		} else {
			this.device.exitPresent();
		}
	}

	connect() {
		let promise: Promise<void>;
		if (isXrNavigator(navigator)) {
			promise = navigator.xr.requestDevice().then(device => {
				device.supportsSession({immersive: true, exclusive: true})
					.then(() => { this.setDevice(device); } )
					.catch(e => {
						this.setDevice(null);
						this.setError(`Session is not support this mode: ${e.errorMessage}.`)
					});
			}).catch(e => this.setError(`Error during requesting device: ${e.errorMessage}.`));
			this.isXr = true;
		} else if ('getVRDisplays' in navigator) {
			promise = navigator.getVRDisplays()
				.then(displays => {
					if (displays.length > 0) {
						this.setDevice(displays[0] as any);
					} else {
						this.setDevice(null);
						this.setError(`VR display is not found yet.`);
					}
				}).catch(e => {
					this.setDevice(null);
					this.setError(`Error during requesting displays: ${e.errorMessage}.`)
				});
			this.isXr = false;
		}

		window.addEventListener('vrdisplayconnect', event => {
			this.setDevice((event as VrEvent).display);
		}, false);

		window.addEventListener('vrdisplaydisconnect', event => {
			this.stop();
			this.setDevice(null);
		}, false);

		window.addEventListener('vrdisplayactivate', event => {
			this.start()
		}, false);

		window.addEventListener('vrdisplaypresentchange', event => {
			const vrEvent = event as VrEvent;
			this._isStarted = vrEvent.display.isPresenting;
			this.trigger('presenting:state:changed');
		}, false );

		return promise;
	}

	private _initVr() {
		this.view.renderer.vr.enabled = true;
		(this.view.renderer as any).setAnimationLoop(this.animationLoop);
	}

	private animationLoop = () => {
		this.view.renderer.render(this.view.scene, this.view.camera);
		// this.handleButtons();
	}

	private _cancelVr() {
		this.view.renderer.vr.enabled = false;
		(this.view.renderer as any).setAnimationLoop(null);
	}
	
	private setError(message: string) {
		this.errorMessages.push(message);
	}

	private setDevice(device: Device) {
		this.device = device;
		this.view.renderer.vr.setDevice(this.device);
		this.trigger('connection:state:changed');
	}

	private handleButtons() {
		if (this._isCanceled) { return; }

		let gp: any;
		if(isWebkitNavigator(navigator)) {
			gp = navigator.webkitGetGamepads()[0];
			// if(gp.buttons[0] == 1) {
			// 	b--;
			//   } else if(gp.buttons[1] == 1) {
			// 	a++;
			//   } else if(gp.buttons[2] == 1) {
			// 	b++;
			//   } else if(gp.buttons[3] == 1) {
			// 	a--;
			//   }
		} else {
			gp = navigator.getGamepads()[0];
			// if(gp.buttons[0].value > 0 || gp.buttons[0].pressed == true) {
			// 	b--;
			//   } else if(gp.buttons[1].value > 0 || gp.buttons[1].pressed == true) {
			// 	a++;
			//   } else if(gp.buttons[2].value > 0 || gp.buttons[2].pressed == true) {
			// 	b++;
			//   } else if(gp.buttons[3].value > 0 || gp.buttons[3].pressed == true) {
			// 	a--;
			//   }
		}
		if (gp && gp.buttons) {
			let index = 0;
			for(const b of gp.buttons) {
				// if (b === 1 || b.value && b.value > 0) {
					// this._isCanceled = true;
					// this.trigger('exit:vr:mode');
					// return;
				// }
				if (b.pressed) {
					console.log(`button-${index++} is pressed`);
					// this.trigger('exit:vr:mode');
					// return;
				}
			}
		}
	}
}