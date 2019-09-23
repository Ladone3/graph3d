import { Subscribable } from '../../utils/subscribeable';

export const DEFAULT_SELECTION_TYPE_ID = 'l3graph-selection';

export interface WidgetEvents {
    'update:widget': any;
}

export abstract class Widget<Events extends WidgetEvents = WidgetEvents> extends Subscribable<Events> {
    readonly widgetId: string;
    onRemove?(): void;
}
