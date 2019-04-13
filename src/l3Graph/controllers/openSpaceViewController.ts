import { Vector2D, Vector3D } from '../models/primitives';
import {
    ViewController,
    ROTATION_DECREASE_SPEED,
    CAMERA_STEP_SPEED,
    ZERO_POSITION,
    BORDER_OPACITY,
} from './viewController';
import {
    handleDragging,
    normalize,
    vector3DToTreeVector3,
    inverse,
    multiply,
    sum,
    KEY_CODES,
    normalLeft,
    normalRight,
    normalUp,
    normalDown,
    KeyHandler,
} from '../utils';

import * as _ from 'lodash';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';

export class OpenSpaceViewController implements ViewController {
    readonly id: string;
    public label: string;
    protected isActive: boolean;
    protected cameraAngle: Vector2D = { x: 0, y: 0 };
    protected position: Vector3D = { x: 1000, y: 0, z: 0 };
    protected startAngle: Vector2D;

    constructor(
        protected view: DiagramView,
        protected mouseHandler: MouseHandler,
        protected keyHandler: KeyHandler,
    ) {
        this.id = _.uniqueId('view-controller-');
        this.label = 'Open Space View Controller';
        this.updateCameraPosition();

        this.keyHandler.on('keyPressed', e => {
            if (this.isActive) {
                this.onKeyPressed(e.data);
            }
        });
        this.mouseHandler.on('paperStartDrag', e => {
            if (this.isActive) {
                this.onMouseDragStart();
                e.data.nativeEvent.stopPropagation();
            }
        });
        this.mouseHandler.on('paperDrag', e => {
            if (this.isActive) {
                this.onMouseDrag(e.data.offset);
                e.data.nativeEvent.stopPropagation();
            }
        });
        this.mouseHandler.on('paperScroll', e => {
            if (this.isActive) {
                this.onMouseWheel(e.data);
                e.data.stopPropagation();
            }
        });
    }

    switchOn() {
        this.isActive = true;
        this.refreshCamera();
    }

    switchOff() {
        this.isActive = false;
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

    protected setCameraDirection(anglePoint: Vector2D) {
        this.cameraAngle = {
            x: anglePoint.x % (Math.PI * 2),
            y: Math.max(-Math.PI / 2 + 0.001, Math.min(anglePoint.y, Math.PI / 2 - 0.001)),
        };
        this.updateCameraPosition();
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
        const maxRadius = this.view.screenParameters.FAR / 2 - BORDER_OPACITY;
        const curTreePos = vector3DToTreeVector3(targetPosition);
        const distanceToTheCenter = curTreePos.distanceTo(ZERO_POSITION);
        if (distanceToTheCenter > maxRadius) {
            const directionFromTheCenter = normalize(targetPosition);
            const directionToTheCenter = inverse(directionFromTheCenter);
            const diffDirection = multiply(directionToTheCenter, distanceToTheCenter - maxRadius);
            return sum(targetPosition, diffDirection);
        } else {
            return targetPosition;
        }
    }

    private onMouseDragStart() {
        this.startAngle = this.cameraAngle;
    }

    private onMouseDrag(offset: Vector2D) {
        this.setCameraDirection({
            x: this.startAngle.x + offset.x / ROTATION_DECREASE_SPEED,
            y: this.startAngle.y - offset.y / ROTATION_DECREASE_SPEED,
        });
    }

    private onMouseWheel(event: MouseWheelEvent) {
        const delta = event.deltaY || event.deltaX || event.deltaZ;
        if (delta > 0) {
            this.stepForward();
        } else {
            this.stepBack();
        }
    }

    private onKeyPressed(keyMap: Set<number>) {
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
        if (keyMap.has(KEY_CODES.SPACE) && !keyMap.has(KEY_CODES.CTRL)) {
            this.stepUp();
        } else if (keyMap.has(KEY_CODES.CTRL) && !keyMap.has(KEY_CODES.SPACE)) {
            this.stepDown();
        }
    }

    private stepLeft() {
        const cameraDirection = this.getCameraDirection();
        const dir = normalLeft(cameraDirection);
        const newPos = sum(this.position, multiply(dir, CAMERA_STEP_SPEED));
        this.position = this.limitPosition(newPos);
        this.updateCameraPosition();
    }

    private stepRight() {
        const cameraDirection = this.getCameraDirection();
        const dir = normalRight(cameraDirection);
        const newPos = sum(this.position, multiply(dir, CAMERA_STEP_SPEED));
        this.position = this.limitPosition(newPos);
        this.updateCameraPosition();
    }

    private stepUp() {
        const cameraDirection = this.getCameraDirection();
        const dir = normalUp(cameraDirection);
        const newPos = sum(this.position, multiply(dir, CAMERA_STEP_SPEED));
        this.position = this.limitPosition(newPos);
        this.updateCameraPosition();
    }

    private stepDown() {
        const cameraDirection = this.getCameraDirection();
        const dir = normalDown(cameraDirection);
        const newPos = sum(this.position, multiply(dir, CAMERA_STEP_SPEED));
        this.position = this.limitPosition(newPos);
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

    private getCameraDirection(): Vector3D {
        return normalize({
            x: Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
            y: Math.sin(this.cameraAngle.y),
            z: Math.sin(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
        });
    }
}
