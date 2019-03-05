import { Vector2D, Vector3D } from '../models/primitives';
import { ViewController } from './viewController';
import { handleDragging } from '../utils';

import * as _ from 'lodash';
import { DiagramView } from '../views/diagramView';

const ZOOM_STEP_MULTIPLAYER = 0.3;
const ROTATION_DECREASE_SPEED = 300;
const KEY_ROTATION_DECREASE_SPEED = 10;
const CAMERA_STEP_SPEED = 20;

export class OpenSpaceViewController implements ViewController {
    readonly id: string;
    label: string;
    protected view: DiagramView;
    protected cameraAngle: Vector2D = { x: 0, y: 0 };
    protected position: Vector3D = { x: 1000, y: 0, z: 0 };

    constructor(view: DiagramView) {
        this.view = view;
        this.id = _.uniqueId('view-controller-');
        this.label = 'Open Space View Controller';
        this.updateCameraPosition();
    }

    onMouseDown(event: MouseEvent) {
        const startAngle = this.cameraAngle;
        handleDragging(event, (dragEvent, offset) => {
            this.setCameraDirection({
                x: startAngle.x + offset.x / ROTATION_DECREASE_SPEED,
                y: startAngle.y - offset.y / ROTATION_DECREASE_SPEED,
            });
        });
    }

    protected setCameraDirection(anglePoint: Vector2D) {
        this.cameraAngle = {
            x: anglePoint.x % (Math.PI * 2),
            y: Math.max(-Math.PI / 2 + 0.001, Math.min(anglePoint.y, Math.PI / 2 - 0.001)),
        };
        this.updateCameraPosition();
    }

    onKeyPressed(keyMap: Set<number>) {
        if (keyMap.has(37) && !keyMap.has(39)) {
            this.stepLeft();
        } else if (keyMap.has(39) && !keyMap.has(37)) {
            this.stepRight();
        }
        if (keyMap.has(38) && !keyMap.has(40)) {
            this.stepBack();
        } else if (keyMap.has(40) && !keyMap.has(38)) {
            this.stepForward();
        }
    }

    onMouseWheel(event: MouseWheelEvent) {
        const delta = event.deltaY || event.deltaX || event.deltaZ;
        if (delta > 0) {
            this.stepForward();
        } else {
            this.stepBack();
        }
    }

    private stepLeft() {
        const cameraDirection = this.getCameraDirection();
        const xAngle = 1 / cameraDirection.x;
        this.position = {
            x: this.position.x + cameraDirection.z * CAMERA_STEP_SPEED,
            y: this.position.y,
            z: this.position.z - cameraDirection.x * CAMERA_STEP_SPEED,
        };
        this.updateCameraPosition();
    }

    private stepRight() {
        const cameraDirection = this.getCameraDirection();
        this.position = {
            x: this.position.x - cameraDirection.z * CAMERA_STEP_SPEED,
            y: this.position.y,
            z: this.position.z + cameraDirection.x * CAMERA_STEP_SPEED,
        };
        this.updateCameraPosition();
    }

    private stepForward() {
        const cameraDirection = this.getCameraDirection();
        this.position = {
            x: this.position.x - cameraDirection.x * CAMERA_STEP_SPEED,
            y: this.position.y - cameraDirection.y * CAMERA_STEP_SPEED,
            z: this.position.z - cameraDirection.z * CAMERA_STEP_SPEED,
        };
        this.updateCameraPosition();
    }

    private stepBack() {
        const cameraDirection = this.getCameraDirection();
        this.position = {
            x: this.position.x + cameraDirection.x * CAMERA_STEP_SPEED,
            y: this.position.y + cameraDirection.y * CAMERA_STEP_SPEED,
            z: this.position.z + cameraDirection.z * CAMERA_STEP_SPEED,
        };
        this.updateCameraPosition();
    }

    focusOn(element: Element) {
        // not implemented
    }

    refreshCamera() {
        const {position, focusDirection} = this.view.cameraState;

        // const cameraDirection = {
        //     x: Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
        //     y: Math.sin(this.cameraAngle.y),
        //     z: Math.sin(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
        // };

        // const cameraFocus = {
        //     x: focusDirection.x - position.x,
        //     y: focusDirection.y - position.y,
        //     z: focusDirection.z - position.z,
        // };
        // const norma = Math.max(
        //     Math.abs(cameraFocus.x),
        //     Math.abs(cameraFocus.y),
        //     Math.abs(cameraFocus.z),
        // );
        // const cameraDirection = {
        //     x: cameraFocus.x / norma,
        //     y: cameraFocus.y / norma,
        //     z: cameraFocus.z / norma,
        // };

        // cameraDirection.x = Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y);
        // cameraDirection.y = Math.sin(this.cameraAngle.y);
        // cameraDirection.z = Math.sin(this.cameraAngle.x) * Math.cos(this.cameraAngle.y)
        // const y = Math.asin(cameraDirection.y);
        // const x = Math.acos(cameraDirection.x / Math.cos(y)) || Math.asin(cameraDirection.z / Math.cos(y));
        // this.cameraAngle = { x, y };

        // this.cameraAngle = { x, y };
        this.position = { x: 0, y: 0, z: 0 };
        this.cameraAngle = { x: 10, y: 0 };

        this.updateCameraPosition();
    }

    private getCameraDirection(): Vector3D {
        return normalize({
            x: Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
            y: Math.sin(this.cameraAngle.y),
            z: Math.sin(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
        });
    }

    protected updateCameraPosition() {
        const cameraDirection = this.getCameraDirection();
        const focusDirection = {
            x: this.position.x + cameraDirection.x,
            y: this.position.y + cameraDirection.y,
            z: this.position.z + cameraDirection.z,
        };
        this.view.cameraState = {
            position: this.position,
            focusDirection,
        };
    }
}

function normalize(vector: Vector3D): Vector3D {
    const norma = Math.max(
        Math.abs(vector.x),
        Math.abs(vector.y),
        Math.abs(vector.z),
    );
    return {
        x: vector.x / norma,
        y: vector.y / norma,
        z: vector.z / norma,
    };
}
