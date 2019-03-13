import { NodeWidget } from './nodeWidget';
import { MouseHandler } from '../../utils/mouseHandler';
import { GraphDescriptor } from '../graph/graphDescriptor';
export interface ArrowHelperParameters<Descriptor extends GraphDescriptor> {
    mouseHandler: MouseHandler<Descriptor>;
}
export declare class ArrowHelper<Descriptor extends GraphDescriptor> extends NodeWidget<Descriptor> {
    private mouseHandler;
    constructor(parameters: ArrowHelperParameters<Descriptor>);
    readonly isVisible: boolean;
}
