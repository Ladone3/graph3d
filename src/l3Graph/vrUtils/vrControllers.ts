import * as THREE from 'three';
import { DiagramView } from '../views/diagramView';
import { WebGLRenderer, VrGamepad } from './webVr';

export class ControllerPickHelper extends THREE.EventDispatcher {
    private raycaster: THREE.Raycaster;
    private objectToColorMap: Map<any/*THREE.Mesh*/, any>;
    private controllerToObjectMap: Map<VrGamepad, any>;
    private tempMatrix: THREE.Matrix4;
    private controllers: any[];

    constructor(private view: DiagramView) {
        super();
        this.raycaster = new THREE.Raycaster();
        this.objectToColorMap = new Map();
        this.controllerToObjectMap = new Map();
        this.tempMatrix = new THREE.Matrix4();

        const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1),
        ]);

        this.controllers = [];
        for (let i = 0; i < 2; ++i) {
            const controller = (view.renderer as WebGLRenderer).vr.getController(i);
            controller.addEventListener('select', event => {
                const controller = event.target;
                const selectedObject = this.controllerToObjectMap.get(controller);
                if (selectedObject) {
                    this.dispatchEvent({ type: 'select', controller, selectedObject });
                }
            });
            view.scene.add(controller);

            const line = new THREE.Line(pointerGeometry);
            line.scale.z = 5;
            controller.add(line);
            this.controllers.push({controller, line});
        }
    }
    reset() {
        // restore the colors
        this.objectToColorMap.forEach((color, object) => {
            object.material.emissive.setHex(color);
        });
        this.objectToColorMap.clear();
        this.controllerToObjectMap.clear();
    }
    update() {
        this.reset();
        for (const { controller, line } of this.controllers) {
            // cast a ray through the from the controller
            this.tempMatrix.identity().extractRotation(controller.matrixWorld);
            this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
            this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
            // get the list of objects the ray intersected
            const intersections = this.raycaster.intersectObjects(this.view.scene.children);
            // if (intersections.length) {
            //     const intersection = intersections[0];
            //     // make the line touch the object
            //     line.scale.z = intersection.distance;
            //     // pick the first object. It's the closest one
            //     const pickedObject = intersection.object;
            //     // save which object this controller picked
            //     this.controllerToObjectMap.set(controller, pickedObject);
            //     // highlight the object if we haven't already
            //     if (this.objectToColorMap.get(pickedObject) === undefined) {
            //         // save its color
            //         this.objectToColorMap.set(pickedObject, (pickedObject as any).material.emissive.getHex());
            //         // set its emissive color to flashing red/yellow
            //         (pickedObject as any).material.emissive.setHex((time * 8) % 2 > 1 ? 0xFF2000 : 0xFF0000);
            //     }
            // } else {
                line.scale.z = 5;
            // }
        }
    }
}