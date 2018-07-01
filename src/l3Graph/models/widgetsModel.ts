import { Subscribable } from '../utils/subscribeable';
import { Widget } from './widget';

export interface WidgetsModelEvents {
    'add:widget': Widget;
    'remove:widget': Widget;
    'widget:update': Widget;
}

export class WidgetsModel extends Subscribable<WidgetsModelEvents> {
    public widgets: Map<string, Widget> = new Map();

    public registerWidget(widget: Widget) {
        this.subscribeOnWidget(widget);
        this.widgets.set(widget.widgetId, widget);
        this.trigger('add:widget', widget);
    }

    public removeWidget(widget: Widget) {
        this.unsubscribeFromElement(widget);
        this.widgets.delete(widget.widgetId);
        this.trigger('remove:widget', widget);
    }

    private subscribeOnWidget(widget: Widget) {
        widget.on('widget:update', event => this.performUpdate(widget));
    }

    private unsubscribeFromElement(widget: Widget) {
        // if (isNode(widget)) {
        //     widget.on('');
        // } else if (isLink(widget)) {

        // }
    }

    public performUpdate(widget: Widget) {
        this.trigger('widget:update', widget);
    }
}
