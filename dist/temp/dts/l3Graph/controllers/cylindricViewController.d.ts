import { SphericalViewController } from './sphericalViewController';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler } from '../utils';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export declare class CylindricalViewController<Descriptor extends GraphDescriptor> extends SphericalViewController<Descriptor> {
    readonly id: string;
    constructor(view: DiagramView<Descriptor>, mouseHandler: MouseHandler<Descriptor>, keyHandler: KeyHandler);
    protected updateCameraPosition(): void;
    protected limitDistance(distance: number): number;
}
