import { Widget, WidgetResolver, WidgetContext } from './models/widgets';
import { SelectionWidget } from './models/widgets/selectionWidget';
import { SelectionView } from './views/selectionView';
import { ArrowHelperView } from './views/arrowHelperView';
import { ArrowHelper } from './models/widgets/arrowHelper';

export const DEFAULT_WIDGET_SET: WidgetResolver[] = [{
    model: (context: WidgetContext) => new SelectionWidget({
        ...context,
        widgetId: 'l3graph-selection-widget',
    }),
    view: (widget: Widget) => new SelectionView(widget as any),
}, {
    model: (context: WidgetContext) => new ArrowHelper({
        ...context,
        widgetId: 'l3graph-arrow-helper-widget',
    }),
    view: (widget: Widget) => new ArrowHelperView(widget as any),
}];
