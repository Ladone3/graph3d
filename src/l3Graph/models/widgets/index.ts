import * as _ from 'lodash';
import { Subscribable } from '../../utils/subscribeable';
import { DiagramModel } from '../diagramModel';
import { MouseHandler } from '../../utils/mouseHandler';
import { KeyHandler } from '../../utils';
import { DiagramWidgetView } from '../../views';

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

export interface WidgetContext {
    diagramModel: DiagramModel;
    keyHandler: KeyHandler;
    mouseHandler: MouseHandler;
}

export type WidgetModelResolver = (diagramModel: WidgetContext) => Widget;
export type WidgetViewResolver = (model: Widget) => DiagramWidgetView;

export interface WidgetResolver {
    model: WidgetModelResolver;
    view: WidgetViewResolver;
}

export * from './arrowHelper';
export * from './nodeWidget';
export * from './reactNodeWidget';
export * from './selectionWidget';
export * from './widgetsModel';
