import { NodeWidget } from './nodeWidget';
import { MouseHandler } from '../../utils/mouseHandler';
import { Node } from '../graph/node';
import { GraphDescriptor } from '../graph/graphDescriptor';

export interface ArrowHelperParameters<Descriptor extends GraphDescriptor> {
    mouseHandler: MouseHandler<Descriptor>;
}

export class ArrowHelper<Descriptor extends GraphDescriptor> extends NodeWidget<Descriptor> {
    private mouseHandler: MouseHandler<Descriptor>;

    constructor(parameters: ArrowHelperParameters<Descriptor>) {
        super({widgetId: 'l3graph-arrow-helper-widget'});
        this.mouseHandler = parameters.mouseHandler;

        this.mouseHandler.on('elementStartDrag', () => {
            const draggedElement = this.mouseHandler.draggedElement;
            if (draggedElement instanceof Node) {
                this.setFocusNode(draggedElement);
            }
        });

        this.mouseHandler.on('elementEndDrag', () => {
            this.setFocusNode(undefined);
        });
    }

    get isVisible() {
        return this.mouseHandler.isDragging;
    }
}
