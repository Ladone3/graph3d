import { WidgetsModel } from '../../models/widgets/widgetsModel';
import { WidgetViewResolver, Widget } from '../../models/widgets/widget';
import { VrManager } from '../../vrUtils/vrManager';
import { DiagramView } from '../diagramView';
import { Core } from '../../core';
export interface WidgetsViewProps {
    diagramView: DiagramView;
    vrManager: VrManager;
    widgetsModel: WidgetsModel;
    core: Core;
}
export declare class WidgetsView<CustomWidget extends Widget> {
    private props;
    private views;
    private viewRegistry;
    diagramView: DiagramView;
    vrManager: VrManager;
    widgetsModel: WidgetsModel;
    constructor(props: WidgetsViewProps);
    registerViewResolver(widgetId: string, viewResolver: WidgetViewResolver<CustomWidget>): void;
    registerWidgetViewForModel(widget: CustomWidget): void;
    removeWidgetViewOfModel(widget: Widget): void;
    private add3dObject;
    private remove3dObject;
    private findViewForWidget;
    update(specificIds?: string[]): void;
}
