import { Subscribable } from '../utils/subscribeable';
import { Widget } from './widget';

export interface WidgetsModelEvents {
    'add:widget': Widget;
    'remove:widget': Widget;
    'update:widget': Widget;
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
        widget.on('update:widget', () => this.trigger('update:widget', widget));
    }

    private unsubscribeFromElement(widget: Widget) {
        // if (isNode(widget)) {
        //     widget.on('');
        // } else if (isLink(widget)) {

        // }
    }
}
