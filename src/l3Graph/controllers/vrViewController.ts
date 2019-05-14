import * as THREE from 'three';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler } from '../utils';
import { ViewController } from './viewController';
import { uniqueId } from 'lodash';

export class VrViewController implements ViewController {
    public readonly id: string;
    public readonly label = 'VR View Controller';
    constructor(
        protected view: DiagramView,
        protected mouseHandler: MouseHandler,
        protected keyHandler: KeyHandler,
    ) {
        this.id = uniqueId('view-controller-');
    }

    refreshCamera() { /* nothing */ }
    focusOn()  { /* nothing */ }

    switchOn() {
        const vrButton: HTMLElement = (THREE as any).WEBVR.createButton(this.view.renderer);
        this.view.vrButton.appendChild(vrButton);
        this.view.renderer.vr.enabled = true;
        (this.view.renderer as any).setAnimationLoop(() => {
            this.view.renderer.render(this.view.scene, this.view.camera);
        });
    }

    switchOff() {
        this.view.vrButton.innerHTML = '';
        this.view.renderer.vr.enabled = false;
        (this.view.renderer as any).setAnimationLoop(null);
    }
}
