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
    graphView: GraphView;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    views: Map<string, View>;

    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    widgetsModel: WidgetsModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;

    private viewRegistry: Map<string, WidgetViewResolver>;

    constructor(props: WidgetsViewProps) {
        this.views = new Map();
        this.graphView = props.graphView;
        this.viewRegistry = new Map();
        this.widgetsModel = props.widgetsModel;
        this.scene = props.scene;
        this.widgetsModel.widgets.forEach(widget => this.addWidgetView(widget));
    }

    public registerView(widgetId: string, viewResolver: WidgetViewResolver) {
        this.viewRegistry.set(widgetId, viewResolver);
    }

    public addWidgetView(widget: Widget) {
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

    public removeWidgetView(widget: Widget) {
        const view = this.views.get(widget.widgetId);
        if (view) {
            if (view.mesh) {
                this.scene.remove(view.mesh);
            }

            if (view.overlayAnchor.isVisible()) {
                this.scene.remove(view.overlayAnchor.getSprite());
            }
        }
        this.views.delete(widget.widgetId);
    }

    private findViewForWidget(widget: Widget): DiagramWidgetView | undefined {
        // if (model.widgetId === 'l3graph-arrow-helper-widget') {
        //     return new ArrowHelperView(model as ArrowHelper);
        // } else if (model.widgetId === 'l3graph-selection-widget') {
        //     return new SelectionView(model as SelectionWidget);
        // } else {
        //     return undefined;
        // }
        return this.viewRegistry.get(widget.widgetId)({
            widget,
            graphView: this.graphView,
        });
    }

    update(specificIds?: string[]) {
        if (specificIds) {
            for (const id of specificIds) {
                const view = this.views.get(id);
                if (view) { // View is added asynchronously
                    view.update();
                }
            }
        } else {
            this.views.forEach(view => {
                view.update();
            });
        }
    }
}
