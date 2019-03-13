import { NodeWidget } from './nodeWidget';
import { MouseHandler } from '../../utils/mouseHandler';
export interface ArrowHelperParameters {
    mouseHandler: MouseHandler;
}
export declare class ArrowHelper extends NodeWidget {
    private mouseHandler;
    constructor(parameters: ArrowHelperParameters);
    readonly isVisible: boolean;
}
