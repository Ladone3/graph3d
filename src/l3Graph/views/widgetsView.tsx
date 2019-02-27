import * as THREE from 'three';
import { DiagramElementView } from './diagramElementView';
import { Selection } from '../models/selection';
import { WidgetsModel } from '../models/widgetsModel';
import { Widget } from '../models/widget';
import { SelectionView } from './selectionView';

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
        this.subscribeOnModel();
    }

    private subscribeOnModel() {
        this.widgetsModel.on('add:widget', event => {
            this.addWidget(event.data);
        });
    }

    private addWidget(widget: Widget) {
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

    private findViewForWidget(model: Widget): DiagramElementView<any> | undefined {
        if (model.widgetId === 'o3d-selection-widget') {
            return new SelectionView(model as Selection);
        } else {
            return undefined;
        }
    }

    update(specificIds?: string[]) {
        if (specificIds) {
            for (const id of specificIds) {
                this.views.get(id).update();
            }
        } else {
            this.views.forEach(view => {
                view.update();
            });
        }
    }
}
