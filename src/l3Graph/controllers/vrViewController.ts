import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler, KEY_CODES, EventObject, Subscribable } from '../utils';
import { ViewController, ViewControllerEvents } from './viewController';
import { VrManager } from '../vrUtils/vrManager';
import { GamepadHandler } from '../vrUtils/gamepadHandler';
import { GraphDescriptor } from '../models/graph/graphDescriptor';

export class VrViewController<Descriptor extends GraphDescriptor> extends
Subscribable<ViewControllerEvents> implements ViewController {
    public readonly id = 'vr-view-controller';
    public readonly label = 'VR View Controller';

    private vrManager: VrManager;

    constructor(
        protected view: DiagramView<Descriptor>,
        protected mouseHandler: MouseHandler<Descriptor>,
        protected keyHandler: KeyHandler,
        protected gamepadHandler: GamepadHandler<Descriptor>,
    ) {
        super();
        this.vrManager = this.view.vrManager;
    }

    focusOn()  { /* nothing */ }

    switchOn() {
        this.vrManager.connect().then(() => {
            this.vrManager.start();
            this.view.renderGraph();
        }).catch((e: Error) => {
            // alert(e.message);
            // tslint:disable-next-line: no-console
            console.error(e.message + e.stack);
            this.switchOff();
        });

        this.keyHandler.on('keyPressed', this.onKeyPressed);
        this.vrManager.on('presenting:state:changed', this.onPresentingChanged);
        this.trigger('switched:on');
    }

    switchOff() {
        if (this.vrManager && this.vrManager.isStarted) {
            this.vrManager.stop();
            this.view.renderGraph();
        }
        this.keyHandler.unsubscribe('keyPressed', this.onKeyPressed);
        this.vrManager.unsubscribe('presenting:state:changed', this.onPresentingChanged);
        this.trigger('switched:off');
    }

    private onKeyPressed = (e: EventObject<'keyPressed', Set<number>>) =>  {
        if (e.data.has(KEY_CODES.ESCAPE)) {
            this.switchOff();
        }
    }

    private onPresentingChanged = () =>  {
        if (!this.vrManager.isStarted) {
            this.switchOff();
        }
    }
}
