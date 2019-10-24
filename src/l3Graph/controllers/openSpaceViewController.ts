import { Vector2d, Vector3d } from '../models/structures';
import {
    ViewController,
    ROTATION_DECREASE_SPEED,
    CAMERA_STEP_SPEED,
    ZERO_POSITION,
    BORDER_OPACITY,
    ViewControllerEvents,
} from './viewController';
import {
    normalize,
    vector3dToTreeVector3,
    inverse,
    multiply,
    sum,
    KEY_CODES,
    normalLeft,
    normalRight,
    normalUp,
    normalDown,
    KeyHandler,
    EventObject,
    Subscribable,
} from '../utils';

import { DiagramView } from '../views/diagramView';
import { MouseHandler, HandlerDragEvent } from '../utils/mouseHandler';

export class OpenSpaceViewController extends Subscribable<ViewControllerEvents> implements ViewController {
    readonly id: string;
    public label: string;
    protected cameraAngle: Vector2d = { x: 0, y: 0 };
    protected position: Vector3d = { x: 1000, y: 0, z: 0 };
    protected startAngle: Vector2d;

    constructor(
        protected view: DiagramView,
        protected mouseHandler: MouseHandler,
        protected keyHandler: KeyHandler,
    ) {
        super();
        this.id = 'open-space-view-controller';
        this.label = 'Open Space View Controller';
        this.updateCameraPosition();
    }

    switchOn() {
        this.keyHandler.on('keyPressed', this.onKeyPressed);
        this.mouseHandler.on('paperStartDrag', this.onMouseDragStart);
        this.mouseHandler.on('paperDrag', this.onMouseDrag);
        this.mouseHandler.on('paperScroll',  this.onMouseWheel);
        this.refreshCamera();
        this.trigger('switched:on');
    }

    switchOff() {
        this.keyHandler.unsubscribe(this.onKeyPressed);
        this.mouseHandler.unsubscribe(this.onMouseDragStart);
        this.mouseHandler.unsubscribe(this.onMouseDrag);
        this.mouseHandler.unsubscribe(this.onMouseWheel);
        this.trigger('switched:off');
    }

    focusOn(element: Element) {
        // not implemented
    }

    private refreshCamera() {
        const {position} = this.view.cameraState;
        this.position = position;

        const curTreePos = vector3dToTreeVector3(position);
        const distance = curTreePos.distanceTo(ZERO_POSITION);

        const y = -Math.asin(position.y / distance);
        const viewDir = normalize(inverse(curTreePos));
        const x = Math.atan2(viewDir.z, viewDir.x);
        // const y = Math.atan2(x, viewDir.y) + Math.PI / 2;
        this.cameraAngle = { x: x, y: y };

        this.updateCameraPosition();
    }

    protected setCameraDirection(anglePoint: Vector2d) {
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

    protected limitPosition(targetPosition: Vector3d): Vector3d {
        const maxRadius = this.view.screenParameters.FAR / 2 - BORDER_OPACITY;
        const curTreePos = vector3dToTreeVector3(targetPosition);
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

    private onMouseDragStart = (event: EventObject<'paperStartDrag', HandlerDragEvent>) => {
        event.data.nativeEvent.stopPropagation()
        this.startAngle = this.cameraAngle;
    }

    private onMouseDrag = (event: EventObject<'paperDrag', HandlerDragEvent>) => {
        event.data.nativeEvent.stopPropagation();
        const offset = event.data.offset;
        this.setCameraDirection({
            x: this.startAngle.x + offset.x / ROTATION_DECREASE_SPEED,
            y: this.startAngle.y - offset.y / ROTATION_DECREASE_SPEED,
        });
    }

    private onMouseWheel = (event: EventObject<'paperScroll', WheelEvent>) => {
        const mouseEvent = event.data;
        mouseEvent.stopPropagation();
        const delta = mouseEvent.deltaY || mouseEvent.deltaX || mouseEvent.deltaZ;
        if (delta > 0) {
            this.stepForward();
        } else {
            this.stepBack();
        }
    }

    private onKeyPressed = (event: EventObject<'keyPressed', Set<number>>) => {
        const keyMap = event.data;
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

    private getCameraDirection(): Vector3d {
        return normalize({
            x: Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
            y: Math.sin(this.cameraAngle.y),
            z: Math.sin(this.cameraAngle.x) * Math.cos(this.cameraAngle.y),
        });
    }
}
