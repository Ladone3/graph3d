import { NodeWidget, NodeWidgetParameters } from './nodeWidget';
import { MouseHandler } from '../../utils/mouseHandler';
import { Node } from '../node';

export interface ArrowHelperParameters extends NodeWidgetParameters {
    widgetId: string;
    mouseHandler: MouseHandler;
}

export class ArrowHelper extends NodeWidget {
    private mouseHandler: MouseHandler;

    constructor(parameters: ArrowHelperParameters) {
        super(parameters);
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
