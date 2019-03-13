import { SphericalViewController } from './sphericalViewController';
import { MouseHandler } from '../input/mouseHandler';
import { KeyHandler } from '../input/keyHandler';
import { Core } from '../core';
export declare class CylindricalViewController extends SphericalViewController {
    readonly id: string;
    constructor(core: Core, mouseHandler: MouseHandler, keyHandler: KeyHandler);
    protected updateCameraPosition(): void;
    protected limitDistance(distance: number): number;
}
