import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler, KEY_CODES, EventObject, Subscribable } from '../utils';
import { ViewController, ViewControllerEvents } from './viewController';
import { VrManager } from '../vrUtils/vrManager';

export class VrViewController extends Subscribable<ViewControllerEvents> implements ViewController {
    public readonly id = 'vr-view-controller';
    public readonly label = 'VR View Controller';

    private vrManager: VrManager;
    private connectionPromise: Promise<void>;

    constructor(
        protected view: DiagramView,
        protected mouseHandler: MouseHandler,
        protected keyHandler: KeyHandler,
    ) {
        super();
        this.vrManager = this.view.vrManager;
        this.connectionPromise = this.vrManager.connect();
    }

    focusOn()  { /* nothing */ }

    switchOn() {
        if (!this.vrManager.isConnected) {
            this.connectionPromise.then(() => {
                this.vrManager.start();
                this.view.renderGraph();
            })
        } else {
            this.vrManager.start();
            this.view.renderGraph();
        }
        
        this.keyHandler.on('keyPressed', this.onKeyPressed);
        this.vrManager.on('presenting:state:changed', this.onPresentingChanged);
        this.trigger('switched:on');
    }

    switchOff() {
        if (this.vrManager && this.vrManager.isStarted) {
            this.vrManager.stop();
            this.view.renderGraph();
        }
        this.keyHandler.unsubscribe(this.onKeyPressed);
        this.vrManager.unsubscribe(this.onPresentingChanged);
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
