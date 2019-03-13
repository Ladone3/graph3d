import { SphericalViewController } from './sphericalViewController';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../input/mouseHandler';
import { KeyHandler } from '../input/keyHandler';
export declare class CylindricalViewController extends SphericalViewController {
    readonly id: string;
    constructor(view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler);
    protected updateCameraPosition(): void;
    protected limitDistance(distance: number): number;
}
