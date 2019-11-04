import * as THREE from 'three';
import { WidgetsModel } from '../../models/widgets/widgetsModel';
import { DiagramWidgetView } from '../viewInterface';
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

export class WidgetsView {
    private views: Map<string, DiagramWidgetView>;
    private viewRegistry: Map<string, WidgetViewResolver>;

    diagramView: DiagramView;
    vrManager: VrManager;
    widgetsModel: WidgetsModel;

    constructor(private props: WidgetsViewProps) {
        this.views = new Map();
        this.diagramView = props.diagramView;
        this.vrManager = props.vrManager;
        this.viewRegistry = new Map();
        this.widgetsModel = props.widgetsModel;
        this.widgetsModel.widgets.forEach(widget => this.registerWidgetViewForModel(widget));
    }

    public registerViewResolver(widgetId: string, viewResolver: WidgetViewResolver) {
        this.viewRegistry.set(widgetId, viewResolver);
    }

    // todo - rename it
    public registerWidgetViewForModel(widget: Widget) {
        const widgetViewExists = this.views.get(widget.widgetId);
        if (widgetViewExists) {
            return; // We already have view for this widget
        }
        const view = this.findViewForWidget(widget);

        if (view) {
            if (view.mesh) {
                this.onAdd3dObject(view.mesh);
            }

            if (view.overlayAnchor) {
                this.onAdd3dObject(view.overlayAnchor.sprite);
            }
            if (view.overlayAnchor3d) {
                this.onAdd3dObject(view.overlayAnchor3d.mesh);
            }
            this.views.set(widget.widgetId, view);
        }
    }

    // todo: Make methods like this more protected - nobody exept DiagramView should use them
    public removeWidgetViewOfModel(widget: Widget) {
        const view = this.views.get(widget.widgetId);
        if (view) {
            if (view.mesh) {
                this.onRemove3dObject(view.mesh);
            }

            if (view.overlayAnchor) {
                this.onRemove3dObject(view.overlayAnchor.sprite);
            }
            if (view.overlayAnchor) {
                this.onRemove3dObject(view.overlayAnchor3d.mesh);
            }
            if (view.onRemove) { view.onRemove(); }
        }
        this.views.delete(widget.widgetId);
    }
    
    private onAdd3dObject(object: THREE.Object3D) {
        this.props.onAdd3dObject(object)
    }

    private onRemove3dObject(object: THREE.Object3D) {
        this.props.onRemove3dObject(object)
    }

    private findViewForWidget(widget: Widget): DiagramWidgetView | undefined {
        return this.viewRegistry.get(widget.widgetId)({
            widget,
            diagramView: this.diagramView,
            vrManager: this.vrManager,
        });
    }

    // Think about improved update of the components to support react continueus render
    update(specificIds?: string[]) {
        const updateView = (widgetId: string) => {
            const view = this.views.get(widgetId);
            if (view) { view.update(); }
        };
        if (specificIds) {
            for (const id of specificIds) {
                updateView(id);
            }
        } else {
            specificIds = [];
            this.views.forEach(view => {
                updateView(view.model.widgetId);
            });
        }
    }
}
