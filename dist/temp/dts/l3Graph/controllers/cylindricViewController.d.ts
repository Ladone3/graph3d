import { SphericalViewController } from './sphericalViewController';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler } from '../utils';
export declare class CylindricalViewController extends SphericalViewController {
    constructor(view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler);
    protected updateCameraPosition(): void;
    protected limitDistance(distance: number): number;
}
