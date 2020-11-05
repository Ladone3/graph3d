import { MouseHandler } from '../input/mouseHandler';
import { EventObject, Subscribable } from '../utils';
import { KeyHandler, KEY_CODES } from '../input/keyHandler';

import { ViewController, ViewControllerEvents } from './viewController';
import { VrManager } from '../vrUtils/vrManager';
import { GamepadHandler } from '../input/gamepadHandler';
import { Core } from '../core';

export class VrViewController extends
Subscribable<ViewControllerEvents> implements ViewController {
    public readonly id = 'vr-core-controller';
    public readonly label = 'VR View Controller';

    private vrManager: VrManager;

    constructor(
        protected core: Core,
        protected mouseHandler: MouseHandler,
        protected keyHandler: KeyHandler,
        protected gamepadHandler: GamepadHandler,
    ) {
        super();
        this.vrManager = this.core.vrManager;
    }

    focusOn()  { /* nothing */ }

    switchOn() {
        this.vrManager.connect().catch((e: Error) => {
            // alert(e.message);
            // tslint:disable-next-line: no-console
            console.error(e.message + e.stack);
            this.switchOff();
        });

        this.keyHandler.on('keyPressed', this.onKeyPressed);
        this.vrManager.on('connection:state:changed', this.onPresentingChanged);
        this.trigger('switched:on');
    }

    switchOff() {
        this.keyHandler.unsubscribe('keyPressed', this.onKeyPressed);
        this.vrManager.unsubscribe('connection:state:changed', this.onPresentingChanged);
        this.trigger('switched:off');
        this.vrManager.disconnect();
        this.core.forceRender();
    }

    private onKeyPressed = (e: EventObject<'keyPressed', Set<number>>) =>  {
        if (e.data.has(KEY_CODES.ESCAPE)) {
            this.switchOff();
        }
    }

    private onPresentingChanged = () =>  {
        if (!this.vrManager.isConnected) {
            this.switchOff();
        }
    }
}
