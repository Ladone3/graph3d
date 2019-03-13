import { Subscribable } from '../../utils/subscribable';
import { MouseHandler } from '../../input/mouseHandler';
import { KeyHandler } from '../../input/keyHandler';
import { DiagramModel } from '../diagramModel';
import { DiagramWidgetView } from '../../views/viewInterface';
import { GamepadHandler } from '../../input/gamepadHandler';
import { VrManager } from '../../vrUtils/vrManager';
import { DiagramView } from '../../views/diagramView';
export declare const DEFAULT_SELECTION_TYPE_ID = "l3graph-selection";
export declare type WidgetId = string & {
    widgetPlaceholder?: boolean;
};
export interface WidgetEvents {
    'update:widget': void;
}
export declare abstract class Widget<Events extends WidgetEvents = WidgetEvents> extends Subscribable<Events> {
    readonly widgetId: WidgetId;
    onRemove?(): void;
    forceUpdate: () => void;
}
export interface WidgetModelContext {
    diagramModel: DiagramModel;
    keyHandler: KeyHandler;
    mouseHandler: MouseHandler;
    gamepadHandler: GamepadHandler;
    vrManager: VrManager;
}
export interface WidgetViewContext<WidgetModel extends Widget> {
    diagramView: DiagramView;
    vrManager: VrManager;
    widget: WidgetModel;
}
export declare type WidgetModelResolver<WidgetModel extends Widget> = (context: WidgetModelContext) => WidgetModel;
export declare type WidgetViewResolver<WidgetModel extends Widget> = (context: WidgetViewContext<WidgetModel>) => DiagramWidgetView;
export interface WidgetFactory<WidgetModel extends Widget> {
    getModel: WidgetModelResolver<WidgetModel>;
    getView: WidgetViewResolver<WidgetModel>;
}
