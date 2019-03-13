import { Subscribable } from '../../utils/subscribable';
import { MouseHandler } from '../../utils/mouseHandler';
import { KeyHandler } from '../../utils';
import { DiagramModel } from '../diagramModel';
import { DiagramWidgetView } from '../../views/viewInterface';
import { GamepadHandler } from '../../vrUtils/gamepadHandler';
import { VrManager } from '../../vrUtils/vrManager';
import { DiagramView } from '../../views/diagramView';
import { GraphDescriptor } from '../graph/graphDescriptor';
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
export interface WidgetModelContext<Descriptor extends GraphDescriptor> {
    diagramModel: DiagramModel<Descriptor>;
    keyHandler: KeyHandler;
    mouseHandler: MouseHandler<Descriptor>;
    gamepadHandler: GamepadHandler<Descriptor>;
    vrManager: VrManager;
}
export interface WidgetViewContext<WidgetModel extends Widget, Descriptor extends GraphDescriptor> {
    diagramView: DiagramView<Descriptor>;
    vrManager: VrManager;
    widget: WidgetModel;
}
export declare type WidgetModelResolver<WidgetModel extends Widget, Descriptor extends GraphDescriptor> = (context: WidgetModelContext<Descriptor>) => WidgetModel;
export declare type WidgetViewResolver<WidgetModel extends Widget, Descriptor extends GraphDescriptor> = (context: WidgetViewContext<WidgetModel, Descriptor>) => DiagramWidgetView;
export interface WidgetFactory<WidgetModel extends Widget, Descriptor extends GraphDescriptor> {
    getModel: WidgetModelResolver<WidgetModel, Descriptor>;
    getView: WidgetViewResolver<WidgetModel, Descriptor>;
}
