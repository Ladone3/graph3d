import { Subscribable } from '../../utils/subscribable';
import { Widget } from './widget';
export interface WidgetsModelEvents {
    'add:widget': Widget;
    'remove:widget': Widget;
    'update:widget': Widget;
}
export declare class WidgetsModel extends Subscribable<WidgetsModelEvents> {
    private widgetModels;
    readonly widgets: ReadonlyMap<string, Widget>;
    registerWidget(widget: Widget): void;
    removeWidget(widget: Widget): void;
    private subscribeOnWidget;
    private unsubscribeFromElement;
}
