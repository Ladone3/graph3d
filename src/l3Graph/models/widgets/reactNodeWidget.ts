import { NodeWidget } from './nodeWidget';
import { ReactOverlay } from '../../customisation';
import { Node } from '../node';
import { WidgetParameters } from './widget';

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
                    if (element instanceof Node) {
                        this.setFocusNode(element);
                    }
                });
            } else {
                this.setFocusNode(null);
            }
        });
    }
}
