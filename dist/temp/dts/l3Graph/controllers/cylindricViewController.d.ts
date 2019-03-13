import { SphericalViewController } from './sphericalViewController';
import { DiagramView } from '../views/diagramView';
export declare class CylindricalViewController extends SphericalViewController {
    constructor(view: DiagramView);
    protected updateCameraPosition(): void;
}
