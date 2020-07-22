import { NodeWidget, NodeWidgetParameters } from './nodeWidget';
import { Node } from '../graph/node';
import { DiagramModel } from '../diagramModel';
import { GraphDescriptor } from '../graph/graphDescriptor';

export interface FocusNodeWidgetParameters<Descriptor extends GraphDescriptor> extends NodeWidgetParameters {
    diagramModel: DiagramModel<Descriptor>;
}

export class FocusNodeWidget<Descriptor extends GraphDescriptor> extends NodeWidget<Descriptor> {
    constructor(parameters: FocusNodeWidgetParameters<Descriptor>) {
        super(parameters);

        const selection = parameters.diagramModel.selection;
        selection.on('change', () => {
            const selectedElements = selection.elements;
            if (selectedElements.size === 1) {
                selectedElements.forEach(element => {
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
