import { Subscribable } from '../../utils/subscribable';
import { MouseHandler } from '../../utils/mouseHandler';
import { KeyHandler } from '../../utils';
import { DiagramModel } from '../diagramModel';
import { DiagramWidgetView } from '../../views/viewInterface';
import { GamepadHandler } from '../../vrUtils/gamepadHandler';
import { VrManager } from '../../vrUtils/vrManager';
import { DiagramView } from '../../views/diagramView';
import { GraphDescriptor } from '../graph/graphDescriptor';

export const DEFAULT_SELECTION_TYPE_ID = 'l3graph-selection';

export type WidgetId = string & { widgetPlaceholder?: boolean };

export interface WidgetEvents {
    'update:widget': void;
}

export abstract class Widget<Events extends WidgetEvents = WidgetEvents> extends Subscribable<Events> {
    readonly widgetId: WidgetId;
    onRemove?(): void;
    forceUpdate = () => {
        this.trigger('update:widget');
    }
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

// todo: rethink the best place for this structures
export type WidgetModelResolver<WidgetModel extends Widget, Descriptor extends GraphDescriptor> = (
    context: WidgetModelContext<Descriptor>
) => WidgetModel;
export type WidgetViewResolver<WidgetModel extends Widget, Descriptor extends GraphDescriptor> = (
    context: WidgetViewContext<WidgetModel, Descriptor>
) => DiagramWidgetView;

export interface WidgetFactory<WidgetModel extends Widget, Descriptor extends GraphDescriptor> {
    getModel: WidgetModelResolver<WidgetModel, Descriptor>;
    getView: WidgetViewResolver<WidgetModel, Descriptor>;
}
