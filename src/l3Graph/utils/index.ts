import Subscribable from './subscribable';

export * from './colorUtils';
export * from './shapeUtils';
export * from './subscribable';
export * from './geometry';

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
): Cancellation{
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

/** Generates random 32-digit hexadecimal string. */
export function generate128BitID() {
    function random32BitDigits() {
        return Math.floor((1 + Math.random()) * 0x100000000)
            .toString(16).substring(1);
    }
    // generate by half because of restricted numerical precision
    return random32BitDigits() + random32BitDigits() + random32BitDigits() + random32BitDigits();
}
