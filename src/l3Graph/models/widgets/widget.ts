import * as _ from 'lodash';
import { Subscribable } from '../../utils/subscribeable';

export const DEFAULT_SELECTION_TYPE_ID = 'l3graph-selection';

export interface WidgetEvents {
    'update:widget': any;
}

export interface Widget<events extends WidgetEvents = WidgetEvents> extends Subscribable<events> {
    readonly widgetId: string;
}