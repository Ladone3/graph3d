import { Vector3D } from './primitives';
import { Subscribable } from '../utils/subscribeable';
export declare const DEFAULT_SELECTION_TYPE_ID = "o3d-selection";
export declare const DEFAULT_NODE_SIZE: Vector3D;
export interface WidgetEvents {
    'widget:update': any;
}
export interface Widget<events extends WidgetEvents = WidgetEvents> extends Subscribable<events> {
    readonly widgetId: string;
}
