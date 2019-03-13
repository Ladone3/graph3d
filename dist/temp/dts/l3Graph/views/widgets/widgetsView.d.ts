import * as THREE from 'three';
import { WidgetsModel } from '../../models/widgets/widgetsModel';
import { WidgetViewResolver, Widget } from '../../models/widgets/widget';
import { VrManager } from '../../vrUtils/vrManager';
import { DiagramView } from '../diagramView';
export interface WidgetsViewProps {
    diagramView: DiagramView;
    vrManager: VrManager;
    widgetsModel: WidgetsModel;
    onAdd3dObject: (object: THREE.Object3D) => void;
    onRemove3dObject: (object: THREE.Object3D) => void;
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
    private onAdd3dObject;
    private onRemove3dObject;
    private findViewForWidget;
    update(specificIds?: string[]): void;
}
