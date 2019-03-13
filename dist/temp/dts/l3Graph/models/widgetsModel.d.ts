import { Subscribable } from '../utils/subscribeable';
import { Widget } from './widget';
export interface WidgetsModelEvents {
    'add:widget': Widget;
    'remove:widget': Widget;
    'update:widget': Widget;
}
export declare class WidgetsModel extends Subscribable<WidgetsModelEvents> {
    widgets: Map<string, Widget>;
    registerWidget(widget: Widget): void;
    removeWidget(widget: Widget): void;
    private subscribeOnWidget(widget);
    private unsubscribeFromElement(widget);
}
