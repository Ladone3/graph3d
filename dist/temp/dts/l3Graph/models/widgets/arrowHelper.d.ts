import { NodeWidget } from './nodeWidget';
import { MouseHandler } from '../../input/mouseHandler';
export interface ArrowHelperParameters {
    mouseHandler: MouseHandler;
}
export declare class ArrowHelper extends NodeWidget {
    private mouseHandler;
    constructor(parameters: ArrowHelperParameters);
    readonly isVisible: boolean;
}
