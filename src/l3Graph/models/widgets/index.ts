import { MouseHandler } from '../../utils/mouseHandler';
import { KeyHandler } from '../../utils';
import { DiagramWidgetView, GraphView } from '../../views';
import { DiagramModel } from '../diagramModel';
import { Widget } from './widget';

export * from './widget';
export * from './arrowHelper';
export * from './nodeWidget';
export * from './focusNodeWidget';
export * from './selectionWidget';
export * from './widgetsModel';

export interface WidgetModelContext {
    diagramModel: DiagramModel;
    keyHandler: KeyHandler;
    mouseHandler: MouseHandler;
}

export interface WidgetViewContext {
    graphView: GraphView;
    widget: Widget;
}

export type WidgetModelResolver = (context: WidgetModelContext) => Widget;
export type WidgetViewResolver = (context: WidgetViewContext) => DiagramWidgetView;

export interface WidgetFactory {
    getModel: WidgetModelResolver;
    getView: WidgetViewResolver;
}
