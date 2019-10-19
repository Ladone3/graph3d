import { Subscribable } from './subscribeable';

export interface KeyHandlerEvents {
    'keyDown': Set<number>;
    'keyPressed': Set<number>;
    'keyUp': Set<number>;
}

export const KEY_CODES = {
    UP: 40,
    DOWN: 38,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
    CTRL: 17,
    PLUS: 107,
    MINUS: 109,
    DELETE: 46,
    ESCAPE: 27,
};

export class KeyHandler extends Subscribable<KeyHandlerEvents> {
    private keyMap: Set<number> = new Set();
    private cancellation: Cancellation | undefined;

    switchOn() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    switchOff() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    private onKeyDown = (event: KeyboardEvent) => {
        const size = this.keyMap.size;
        const key = event.keyCode || event.which;

        this.keyMap.add(key);

        const newSize = this.keyMap.size;
        if (newSize > size && !this.cancellation) {
            this.cancellation = this.start();
            this.trigger('keyDown', this.keyMap);
        }
    }

    private onKeyUp = (event: KeyboardEvent) => {
        const key = event.keyCode || event.which;
        this.keyMap.delete(key);
        if (this.keyMap.size === 0 && this.cancellation) {
            this.cancellation.stop();
            this.cancellation = undefined;
            this.trigger('keyUp', this.keyMap);
        }
    }

    private start(): Cancellation {
        return animationFrameInterval(() => {
            this.trigger('keyPressed', this.keyMap);
        });
    }
}

export interface CancellationEvents {
    'cancel': void;
}

export class Cancellation extends Subscribable<CancellationEvents> {
    public isCancelled: boolean = false;
    stop() {
        this.isCancelled = true;
        this.trigger('cancel');
    }
}

export function animationFrameInterval(
    intervalCallback: () => void,
): Cancellation {
    const cancellation = new Cancellation();
    let animationFrameId: number;

    const animate = (time: number) => {
        if (!cancellation.isCancelled) {
            intervalCallback();
            animationFrameId = requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);

    cancellation.on('cancel', () => {
        cancelAnimationFrame(animationFrameId);
    });

    return cancellation;
}
