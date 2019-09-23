import { Element } from '../graphModel';
import { DiagramModel } from '../diagramModel';
import { Widget } from './widget';
import { Node } from '../node';

export interface SelectionParameters {
    widgetId: string;
    diagramModel: DiagramModel;
}

export class SelectionWidget extends Widget {
    public readonly widgetId: string;
    private readonly diagramModel: DiagramModel;

    constructor(parameters: SelectionParameters) {
        super();
        this.diagramModel = parameters.diagramModel;

        this.diagramModel.selection.on('change', e => {
            const previousSelection = e.data;
            this.updateSubscription(previousSelection);
        });
    }

    public get selectedElements() {
        const elements: Element[] = [];
        this.diagramModel.selection.elements.forEach(el => elements.push(el));
        return elements;
    }

    private updateSubscription(previousSelection: ReadonlySet<Element> | undefined) {
        if (previousSelection) {
            previousSelection.forEach(el => {
                el.unsubscribe(this.updateView);
            });
        }
        const newSelection = this.diagramModel.selection.elements;
        if (newSelection.size > 0) {
            newSelection.forEach(el => {
                if (el instanceof Node) {
                    el.on('change:position', this.updateView);
                    el.on('change:size', this.updateView);
                }
            });
        }
        this.updateView();
    }

    private updateView = () => {
        this.trigger('update:widget', this);
    }
}
