import { Vector3D } from './primitives';
import * as _ from 'lodash';
import { Subscribable } from '../utils/subscribeable';

export const DEFAULT_SELECTION_TYPE_ID = 'o3d-selection';
export const DEFAULT_NODE_SIZE: Vector3D = { x: 1, y: 1, z: 1 };

export interface WidgetEvents {
    'widget:update': any;
}

export interface Widget<events extends WidgetEvents = WidgetEvents> extends Subscribable<events> {
    readonly widgetId: string;
}
