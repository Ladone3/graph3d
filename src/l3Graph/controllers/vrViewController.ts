import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../input/mouseHandler';
import { EventObject, Subscribable } from '../utils';
import { KeyHandler, KEY_CODES } from '../input/keyHandler';

import { ViewController, ViewControllerEvents } from './viewController';
import { VrManager } from '../vrUtils/vrManager';
import { GamepadHandler } from '../input/gamepadHandler';

export class VrViewController extends
Subscribable<ViewControllerEvents> implements ViewController {
    public readonly id = 'vr-view-controller';
    public readonly label = 'VR View Controller';

    private vrManager: VrManager;

    constructor(
        protected view: DiagramView,
        protected mouseHandler: MouseHandler,
        protected keyHandler: KeyHandler,
        protected gamepadHandler: GamepadHandler,
    ) {
        super();
        this.vrManager = this.view.vrManager;
    }

    focusOn()  { /* nothing */ }

    switchOn() {
        this.vrManager.connect().then(() => {
            this.switchOff();
            this.view.renderGraph();
        }).catch((e: Error) => {
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
        this.view.renderGraph();
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
