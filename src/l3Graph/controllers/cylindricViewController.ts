import { SphericalViewController } from './sphericalViewController';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler } from '../utils';
import { BORDER_OPACITY } from './viewController';
import { GraphDescriptor } from '../models/graph/graphDescriptor';

export class CylindricalViewController<Descriptor extends GraphDescriptor> extends SphericalViewController<Descriptor> {
    readonly id: string;
    constructor(
        view: DiagramView<Descriptor>,
        mouseHandler: MouseHandler<Descriptor>,
        keyHandler: KeyHandler,
    ) {
        super(view, mouseHandler, keyHandler);
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
        this.view.cameraState = {
            position: cameraPosition,
            focusDirection,
        };
    }

    protected limitDistance(distance: number) {
        return Math.min(Math.max(0.001, distance), (this.view.screenParameters.FAR / 2 - BORDER_OPACITY) / 2);
    }
}
