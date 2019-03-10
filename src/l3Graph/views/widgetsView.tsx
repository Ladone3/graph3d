import * as THREE from 'three';
import { DiagramElementView } from './diagramElementView';
import { Selection } from '../models/selection';
import { WidgetsModel } from '../models/widgetsModel';
import { Widget } from '../models/widget';
import { SelectionView } from './selectionView';
import { ArrowHelper } from '../models/arrowHelper';
import { ArrowHelperView } from './arrowHelperView';

export interface WidgetsViewProps {
    widgetsModel: WidgetsModel;
    scene: THREE.Scene;
}

export class WidgetsView {
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    views: Map<string, DiagramElementView<any>>;

    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    widgetsModel: WidgetsModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;

    constructor(private props: WidgetsViewProps) {
        this.views = new Map();
        this.widgetsModel = props.widgetsModel;
        this.scene = props.scene;
        this.widgetsModel.widgets.forEach(widget => this.addWidgetView(widget));
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
            if (view.overlay) {
                this.scene.add(view.overlay);
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

            if (view.overlay) {
                this.scene.remove(view.overlay);
            }
        }
        this.views.delete(widget.widgetId);
    }

    private findViewForWidget(model: Widget): DiagramElementView<any> | undefined {
        if (model.widgetId === 'o3d-arrow-helper-widget') {
            return new ArrowHelperView(model as ArrowHelper);
        } else if (model.widgetId === 'o3d-selection-widget') {
            return new SelectionView(model as Selection);
        } else {
            return undefined;
        }
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
