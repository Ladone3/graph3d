import { SphericalViewController } from './sphericalViewController';
import { MouseHandler } from '../input/mouseHandler';
import { KeyHandler } from '../input/keyHandler';
import { BORDER_OPACITY } from './viewController';
import { Core } from '../core';

export class CylindricalViewController extends SphericalViewController {
    readonly id: string;
    constructor(
        core: Core,
        mouseHandler: MouseHandler,
        keyHandler: KeyHandler,
    ) {
        super(core, mouseHandler, keyHandler);
        this.id = 'cylindrical-view-controller';
        this.label = 'Cylindrical View Controller';
    }

    protected updateCameraPosition() {
        const cameraPosition = {
            x: Math.cos(this.cameraAngle.x) * this.cameraDistance,
            y: Math.sin(this.cameraAngle.y) * this.cameraDistance,
            z: Math.sin(this.cameraAngle.x) * this.cameraDistance,
        };
        const focusDirection = {
            x: 0,
            y: cameraPosition.y,
            z: 0,
        };
        this.core.setCameraState({
            position: cameraPosition,
            focusDirection,
        });
    }

    protected limitDistance(distance: number) {
        return Math.min(Math.max(0.001, distance), (this.core.screenParameters.FAR / 2 - BORDER_OPACITY) / 2);
    }
}
