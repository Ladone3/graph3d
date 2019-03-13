import { Subscribable } from '../../utils/subscribeable';
import { MouseHandler } from '../../utils/mouseHandler';
import { KeyHandler } from '../../utils';
import { DiagramModel } from '../diagramModel';
import { DiagramWidgetView } from '../../views/viewInterface';
import { GamepadHandler } from '../../vrUtils/gamepadHandler';
import { VrManager } from '../../vrUtils/vrManager';
import { DiagramView } from '../../views/diagramView';
export declare const DEFAULT_SELECTION_TYPE_ID = "l3graph-selection";
export interface WidgetEvents {
    'update:widget': void;
}
export declare abstract class Widget<Events extends WidgetEvents = WidgetEvents> extends Subscribable<Events> {
    readonly widgetId: string;
    onRemove?(): void;
    forceUpdate: () => void;
}
export interface WidgetModelContext {
    diagramModel: DiagramModel;
    keyHandler: KeyHandler;
    mouseHandler: MouseHandler;
    gamepadHandler: GamepadHandler;
}
export interface WidgetViewContext<WidgetModel extends Widget = Widget> {
    diagramView: DiagramView;
    vrManager: VrManager;
    widget: WidgetModel;
}
export declare type WidgetModelResolver<WidgetModel extends Widget = Widget> = (context: WidgetModelContext) => WidgetModel;
export declare type WidgetViewResolver<WidgetModel extends Widget = Widget> = (context: WidgetViewContext<WidgetModel>) => DiagramWidgetView;
export interface WidgetFactory<WidgetModel extends Widget = any> {
    getModel: WidgetModelResolver<WidgetModel>;
    getView: WidgetViewResolver<WidgetModel>;
}
