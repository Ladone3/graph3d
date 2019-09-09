import * as _ from 'lodash';
import { Subscribable } from '../../utils/subscribeable';
import { MouseHandler } from '../../utils/mouseHandler';
import { KeyHandler } from '../../utils';
import { DiagramWidgetView, GraphView } from '../../views';
import { DiagramModel } from '../diagramModel';

export const DEFAULT_SELECTION_TYPE_ID = 'l3graph-selection';

export interface WidgetEvents {
    'update:widget': any;
}

export interface WidgetParameters {
    widgetId: string;
    diagramModel: DiagramModel;
    keyHandler: KeyHandler;
    mouseHandler: MouseHandler;
}

export abstract class Widget<Events extends WidgetEvents = any> extends Subscribable<Events> {
    readonly widgetId: string;
    constructor(parameters: WidgetParameters) {
        super();
        this.widgetId = parameters.widgetId;
    }
}

export interface WidgetModelContext {
    diagramModel: DiagramModel;
    keyHandler: KeyHandler;
    mouseHandler: MouseHandler;
}

export interface WidgetViewContext {
    graphView: GraphView;
    widget: Widget;
}
