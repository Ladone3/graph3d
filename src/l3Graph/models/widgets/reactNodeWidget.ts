import { NodeWidget } from './nodeWidget';
import { WidgetParameters } from '.';
import { isNode } from '../graphModel';
import { ReactOverlay } from '../../customisation';

export interface ReactNodeWidgetParameters extends WidgetParameters {
    overlay: ReactOverlay;
}

export class ReactNodeWidget extends NodeWidget {
    public readonly overlay: ReactOverlay;

    constructor(parameters: ReactNodeWidgetParameters) {
        super(parameters);

        this.overlay = parameters.overlay;

        const selection = parameters.diagramModel.selection;
        selection.on('change', () => {
            const selecteElements = selection.elements;
            if (selecteElements.size === 1) {
                selecteElements.forEach(element => {
                    if (isNode(element)) {
                        this.setFocusNode(element);
                    }
                });
            } else {
                this.setFocusNode(null);
            }
        });
    }
}
