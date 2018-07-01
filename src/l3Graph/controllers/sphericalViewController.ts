import { Vector2D } from '../models/primitives';
import { ViewController } from './viewController';
import { handleDragging } from '../utils/utils';

import * as _ from 'lodash';
import { DiagramView } from '../views/diagramView';

const ZOOM_STEP_MULTIPLAYER = 0.3;
const ROTATION_DECREASE_SPEED = 100;
const KEY_ROTATION_DECREASE_SPEED = 10;
const MAX_DISTANCE = 500;

export class SphericalViewController implements ViewController {
    readonly id: string;
    label: string;
    protected view: DiagramView;
    protected cameraAngle: Vector2D = { x: 0, y: Math.PI / 4 };
    protected cameraDistance: number = 1000;

    constructor(view: DiagramView) {
        this.view = view;
        this.id = _.uniqueId('view-controller-');
        this.label = 'Spherical View Controller';
        this.updateCameraPosition();
    }

    onMouseDown(event: MouseEvent) {
        const startAngle = this.cameraAngle;
        handleDragging(event, (dragEvent, offset) => {
            this.setCameraAngle({
                x: startAngle.x + offset.x / ROTATION_DECREASE_SPEED,
                y: startAngle.y + offset.y / (ROTATION_DECREASE_SPEED * 3),
            });
        });
    }

    onKeyPressed(keyMap: Set<number>) {
        const currentAngle = this.cameraAngle;
        let x = 0;
        let y = 0;

        if (keyMap.has(37) && !keyMap.has(39)) {
            x = -1;
        } else if (keyMap.has(39) && !keyMap.has(37)) {
            x = 1;
        }
        if (keyMap.has(38) && !keyMap.has(40)) {
            y = -1;
        } else if (keyMap.has(40) && !keyMap.has(38)) {
            y = 1;
        }

        this.setCameraAngle({
            x: currentAngle.x + x / KEY_ROTATION_DECREASE_SPEED,
            y: currentAngle.y + y / (KEY_ROTATION_DECREASE_SPEED * 3),
        });
    }

    onMouseWheel(event: MouseWheelEvent) {
        const delta = event.deltaY || event.deltaX || event.deltaZ;
        const curDistance = this.cameraDistance;
        this.setCameraDistance(
            curDistance + delta * (curDistance / MAX_DISTANCE) * ZOOM_STEP_MULTIPLAYER,
        );
    }

    refreshCamera() {
        const {position, focusDirection} = this.view.cameraState;
        this.cameraDistance = Math.sqrt(
            Math.pow(position.x, 2) +
            Math.pow(position.y, 2) +
            Math.pow(position.z, 2)
        );

        const y = Math.asin(position.y / this.cameraDistance);
        // x = Math.cos(this.cameraAngle.x) * this.cameraDistance * Math.cos(this.cameraAngle.y)
        let x = Math.acos(
            position.x / (
                Math.cos(y) * this.cameraDistance
            )
        );
        if (
            Math.round(position.x) !== Math.round(Math.cos(x) * this.cameraDistance * Math.cos(y)) ||
            Math.round(position.z) !== Math.round(Math.sin(x) * this.cameraDistance * Math.cos(y))
        ) {
            x = Math.asin(
                position.z / (
                    Math.cos(y) * this.cameraDistance
                )
            );
        }
        this.cameraAngle = { x, y };
        this.updateCameraPosition();
    }

    focusOn(element: Element) {
        // not implemented
    }

    protected setCameraAngle(anglePoint: Vector2D) {
        this.cameraAngle = {
            x: anglePoint.x % (Math.PI * 2),
            y: Math.max(-Math.PI / 2 + 0.001, Math.min(anglePoint.y, Math.PI / 2 - 0.001)),
        };
        this.updateCameraPosition();
    }

    protected setCameraDistance(distance: number) {
        this.cameraDistance = Math.max(0.001, distance);
        this.updateCameraPosition();
    }

    protected updateCameraPosition() {
        const cameraPosition = {
            x: Math.cos(this.cameraAngle.x) * this.cameraDistance * Math.cos(this.cameraAngle.y),
            y: Math.sin(this.cameraAngle.y) * this.cameraDistance,
            z: Math.sin(this.cameraAngle.x) * this.cameraDistance * Math.cos(this.cameraAngle.y),
        };
        this.view.cameraState = {
            position: cameraPosition,
            focusDirection: this.view.scene.position,
        };
    }
}
