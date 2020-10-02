import { NodeWidget } from './nodeWidget';
import { MouseHandler } from '../../input/mouseHandler';
import { Node } from '../graph/node';

export interface ArrowHelperParameters {
    mouseHandler: MouseHandler;
}

export class ArrowHelper extends NodeWidget {
    private mouseHandler: MouseHandler;

    constructor(parameters: ArrowHelperParameters) {
        super({widgetId: 'l3graph-arrow-helper-widget'});
        this.mouseHandler = parameters.mouseHandler;

        this.mouseHandler.on('elementDragStart', () => {
            const draggedElement = this.mouseHandler.draggedElement;
            if (draggedElement instanceof Node) {
                this.setFocusNode(draggedElement);
            }
        });

        this.mouseHandler.on('elementDragEnd', () => {
            this.setFocusNode(undefined);
        });
    }

    get isVisible() {
        return this.mouseHandler.isDragging;
    }
}
