import { SphericalViewController } from './sphericalViewController';
import { DiagramView } from '../views/diagramView';

export class CylindricalViewController extends SphericalViewController {
    constructor(view: DiagramView) {
        super(view);
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
}
