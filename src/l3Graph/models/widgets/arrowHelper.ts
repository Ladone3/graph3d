import { NodeWidget } from './nodeWidget';
import { WidgetParameters } from '.';
import { MouseHandler } from '../../utils/mouseHandler';
import { isNode } from '../graphModel';

export class ArrowHelper extends NodeWidget {
    private mouseHandler: MouseHandler;

    constructor(parameters: WidgetParameters) {
        super(parameters);
        this.mouseHandler = parameters.mouseHandler;

        this.mouseHandler.on('elementStartDrag', () => {
            const draggedElement = this.mouseHandler.draggedElement;
            if (isNode(draggedElement)) {
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
