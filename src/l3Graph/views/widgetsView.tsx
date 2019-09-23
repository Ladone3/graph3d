import * as THREE from 'three';
import { WidgetsModel } from '../models/widgets/widgetsModel';
import { Widget, WidgetViewResolver } from '../models/widgets';
import { GraphView } from './graphView';
import { View, DiagramWidgetView } from './viewInterface';

export interface WidgetsViewProps {
    graphView: GraphView;
    widgetsModel: WidgetsModel;
    scene: THREE.Scene;
}

export class WidgetsView {
    private views: Map<string, DiagramWidgetView>;
    private viewRegistry: Map<string, WidgetViewResolver>;

    graphView: GraphView;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;

    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    widgetsModel: WidgetsModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;

    constructor(props: WidgetsViewProps) {
        this.views = new Map();
        this.graphView = props.graphView;
        this.viewRegistry = new Map();
        this.widgetsModel = props.widgetsModel;
        this.scene = props.scene;
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
                this.scene.add(view.mesh);
            }

            if (view.overlayAnchor.isVisible()) {
                this.scene.add(view.overlayAnchor.getSprite());
            }
            this.views.set(widget.widgetId, view);
        }
    }

    // todo: Make methods like this more protected - nobody exept DiagramView should use them
    public removeWidgetViewOfModel(widget: Widget) {
        const view = this.views.get(widget.widgetId);
        if (view) {
            if (view.mesh) {
                this.scene.remove(view.mesh);
            }

            if (view.overlayAnchor.isVisible()) {
                this.scene.remove(view.overlayAnchor.getSprite());
            }
            if (view.onRemove) { view.onRemove(); }
        }
        this.views.delete(widget.widgetId);
    }

    private findViewForWidget(widget: Widget): DiagramWidgetView | undefined {
        return this.viewRegistry.get(widget.widgetId)({
            widget,
            graphView: this.graphView,
        });
    }

    // Think about improved update of the components to support react continueus render
    update(specificIds: string[]) {
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
