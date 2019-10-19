import { Subscribable } from '../../utils/subscribeable';
import { MouseHandler } from '../../utils/mouseHandler';
import { KeyHandler } from '../../utils';
import { DiagramModel } from '../diagramModel';
import { GraphView } from '../../views/graph/graphView';
import { DiagramWidgetView } from '../../views/viewInterface';
import { ThreejsVrManager } from '../../vrUtils/webVr';
import { GamepadHandler } from '../../vrUtils/gamepadHandler';

export const DEFAULT_SELECTION_TYPE_ID = 'l3graph-selection';

export interface WidgetEvents {
    'update:widget': void;
}

export abstract class Widget<Events extends WidgetEvents = WidgetEvents> extends Subscribable<Events> {
    readonly widgetId: string;
    onRemove?(): void;
    forceUpdate = () => {
        this.trigger('update:widget');
    }
}

export interface WidgetModelContext {
    diagramModel: DiagramModel;
    keyHandler: KeyHandler;
    mouseHandler: MouseHandler;
    gamepadHandler: GamepadHandler;
}

export interface WidgetViewContext<WidgetModel extends Widget = Widget> {
    graphView: GraphView;
    vrManager: ThreejsVrManager;
    widget: WidgetModel;
}

// todo: rethink the best place for this structures
export type WidgetModelResolver<WidgetModel extends Widget = Widget> = (context: WidgetModelContext) => WidgetModel;
export type WidgetViewResolver<WidgetModel extends Widget = Widget> = (context: WidgetViewContext<WidgetModel>) => DiagramWidgetView;

export interface WidgetFactory<WidgetModel extends Widget = any> {
    getModel: WidgetModelResolver<WidgetModel>;
    getView: WidgetViewResolver<WidgetModel>;
}
