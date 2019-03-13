import * as THREE from 'three';
import { WidgetsModel } from '../../models/widgets/widgetsModel';
import { WidgetViewResolver, Widget } from '../../models/widgets/widget';
import { VrManager } from '../../vrUtils/vrManager';
import { DiagramView } from '../diagramView';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export interface WidgetsViewProps<Descriptor extends GraphDescriptor> {
    diagramView: DiagramView<Descriptor>;
    vrManager: VrManager;
    widgetsModel: WidgetsModel;
    onAdd3dObject: (object: THREE.Object3D) => void;
    onRemove3dObject: (object: THREE.Object3D) => void;
}
export declare class WidgetsView<CustomWidget extends Widget, Descriptor extends GraphDescriptor> {
    private props;
    private views;
    private viewRegistry;
    diagramView: DiagramView<Descriptor>;
    vrManager: VrManager;
    widgetsModel: WidgetsModel;
    constructor(props: WidgetsViewProps<Descriptor>);
    registerViewResolver(widgetId: string, viewResolver: WidgetViewResolver<CustomWidget, Descriptor>): void;
    registerWidgetViewForModel(widget: CustomWidget): void;
    removeWidgetViewOfModel(widget: Widget): void;
    private onAdd3dObject;
    private onRemove3dObject;
    private findViewForWidget;
    update(specificIds?: string[]): void;
}
