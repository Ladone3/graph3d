import { Widget, WidgetFabric, WidgetModelContext, WidgetViewContext } from './models/widgets';
import { SelectionWidget } from './models/widgets/selectionWidget';
import { SelectionView } from './views/selectionView';
import { ArrowHelperView } from './views/arrowHelperView';
import { ArrowHelper } from './models/widgets/arrowHelper';

export const DEFAULT_WIDGET_FABRICS: WidgetFabric[] = [{
    model: (context: WidgetModelContext) => new SelectionWidget({
        ...context,
        widgetId: 'l3graph-selection-widget',
    }),
    view: (context: WidgetViewContext) => new SelectionView({
        model: context.widget as any,
        graphView: context.graphView,
    }),
}, {
    model: (context: WidgetModelContext) => new ArrowHelper({
        ...context,
        widgetId: 'l3graph-arrow-helper-widget',
    }),
    view: (context: WidgetViewContext) => new ArrowHelperView({
        model: context.widget as any,
        graphView: context.graphView,
    }),
}];
