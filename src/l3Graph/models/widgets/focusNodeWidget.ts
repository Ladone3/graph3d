import { NodeWidget, NodeWidgetParameters } from './nodeWidget';
import { Node } from '../graph/node';
import { DiagramModel } from '../diagramModel';

export interface FocusNodeWidgetParameters extends NodeWidgetParameters {
    diagramModel: DiagramModel;
}

export class FocusNodeWidget extends NodeWidget {
    constructor(parameters: FocusNodeWidgetParameters) {
        super(parameters);

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
