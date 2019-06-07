import * as THREE from 'three';
import * as ReactDOM from 'react-dom';
import { createElement } from 'react';

import { DiagramWidgetView } from '.';
import { ReactNodeWidget } from '../models/widgets/reactNodeWidget';
import { createContextProvider } from '../customisation';

export class ReactNodeWidgetView implements DiagramWidgetView<ReactNodeWidget> {
    public readonly model: ReactNodeWidget;
    public readonly mesh: THREE.Group;
    public readonly overlay: THREE.CSS3DObject;

    private htmlOverlay: HTMLElement;
    private htmlBody: HTMLElement;
    private boundingBox: THREE.Box3;

    constructor(model: ReactNodeWidget) {
        this.model = model;
        this.mesh = null;

        this.htmlOverlay = document.createElement('DIV');
        this.htmlOverlay.className = 'l3graph-overlayed-html-container';

        this.htmlBody = document.createElement('DIV');
        this.htmlBody.className = 'l3graph-overlayed-html-view';
        this.htmlOverlay.appendChild(this.htmlBody);

        this.overlay = new THREE.CSS3DSprite(this.htmlOverlay);

        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const isWidgetVisible = Boolean(this.model.focusNode);
        this.overlay.visible = isWidgetVisible;

        if (isWidgetVisible && this.model.focusNode) {
            const reactOverlay = this.model.overlay;
            const nodeData = this.model.focusNode.data;
            const Overlay = reactOverlay.get(this.model.focusNode.data);
            if (reactOverlay.context) {
                const Context = createContextProvider(reactOverlay.context);
                ReactDOM.render(createElement(Context, null,
                    createElement(Overlay, nodeData),
                ), this.htmlBody);
            } else {
                ReactDOM.render(createElement(Overlay, nodeData), this.htmlBody);
            }
        } else {
            ReactDOM.unmountComponentAtNode(this.htmlBody);
        }

        const position = isWidgetVisible ? this.model.focusNode.position : { x: 0, y: 0, z: 0 };
        this.overlay.position.set(position.x, position.y, position.z);
    }
}
