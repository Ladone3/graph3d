import { Vector2D, Vector3D } from '../models/primitives';
import {
    ViewController,
    ROTATION_DECREASE_SPEED,
    CAMERA_STEP_SPEED,
    ZERO_POSITION,
    LIMIT_OPACITY,
} from './viewController';
import { handleDragging, normalize, vector3DToTreeVector3, inverse, miltiply, sum, KEY_CODES } from '../utils';

import * as _ from 'lodash';
import { DiagramView } from '../views/diagramView';

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
        if (keyMap.has(KEY_CODES.LEFT) && !keyMap.has(KEY_CODES.RIGHT)) {
            this.stepLeft();
        } else if (keyMap.has(KEY_CODES.RIGHT) && !keyMap.has(KEY_CODES.LEFT)) {
            this.stepRight();
        }
        if (keyMap.has(KEY_CODES.DOWN) && !keyMap.has(KEY_CODES.UP)) {
            this.stepBack();
        } else if (keyMap.has(KEY_CODES.UP) && !keyMap.has(KEY_CODES.DOWN)) {
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
        this.position = this.limitPosition({
            x: this.position.x + cameraDirection.z * CAMERA_STEP_SPEED,
            y: this.position.y,
            z: this.position.z - cameraDirection.x * CAMERA_STEP_SPEED,
        });
        this.updateCameraPosition();
    }

    private stepRight() {
        const cameraDirection = this.getCameraDirection();
        this.position = this.limitPosition({
            x: this.position.x - cameraDirection.z * CAMERA_STEP_SPEED,
            y: this.position.y,
            z: this.position.z + cameraDirection.x * CAMERA_STEP_SPEED,
        });
        this.updateCameraPosition();
    }

    private stepForward() {
        const cameraDirection = this.getCameraDirection();
        this.position = this.limitPosition({
            x: this.position.x - cameraDirection.x * CAMERA_STEP_SPEED,
            y: this.position.y - cameraDirection.y * CAMERA_STEP_SPEED,
            z: this.position.z - cameraDirection.z * CAMERA_STEP_SPEED,
        });
        this.updateCameraPosition();
    }

    private stepBack() {
        const cameraDirection = this.getCameraDirection();
        this.position = this.limitPosition({
            x: this.position.x + cameraDirection.x * CAMERA_STEP_SPEED,
            y: this.position.y + cameraDirection.y * CAMERA_STEP_SPEED,
            z: this.position.z + cameraDirection.z * CAMERA_STEP_SPEED,
        });
        this.updateCameraPosition();
    }

    focusOn(element: Element) {
        // not implemented
    }

    refreshCamera() {
        const {position} = this.view.cameraState;
        this.position = position;

        const curTreePos = vector3DToTreeVector3(position);
        const distance = curTreePos.distanceTo(ZERO_POSITION);

        const y = -Math.asin(position.y / distance);
        const viewDir = normalize(inverse(curTreePos));
        const x = Math.atan2(viewDir.z, viewDir.x);
        // const y = Math.atan2(x, viewDir.y) + Math.PI / 2;
        this.cameraAngle = { x: x, y: y };

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

    protected limitPosition(targetPosition: Vector3D): Vector3D {
        const maxRadius = this.view.screenParameters.FAR / 2 - LIMIT_OPACITY;
        const curTreePos = vector3DToTreeVector3(targetPosition);
        const distanceToTheCenter = curTreePos.distanceTo(ZERO_POSITION);
        if (distanceToTheCenter > maxRadius) {
            const directionFromTheCenter = normalize(targetPosition);
            const directionToTheCenter = inverse(directionFromTheCenter);
            const diffDirection = miltiply(directionToTheCenter, distanceToTheCenter - maxRadius);
            return sum(targetPosition, diffDirection);
        } else {
            return targetPosition;
        }
    }
}
