import { WidgetFactory, WidgetModelContext, WidgetViewContext, Widget } from './models/widgets';
import { SelectionWidget } from './models/widgets/selectionWidget';
import { SelectionView } from './views/selectionView';
import { ArrowHelperView } from './views/arrowHelperView';
import { ArrowHelper } from './models/widgets/arrowHelper';

export const DEFAULT_MESH_WIDGET_SET: WidgetFactory[] = [{
    getModel: (context: WidgetModelContext) => new SelectionWidget({
        widgetId: 'l3graph-selection-widget',
        diagramModel: context.diagramModel,
    }),
    getView: (context: WidgetViewContext) => new SelectionView({
        model: context.widget as SelectionWidget,
    }),
}, {
    getModel: (context: WidgetModelContext) => {
        return new ArrowHelper({
            widgetId: 'l3graph-arrow-helper-widget',
            mouseHandler: context.mouseHandler,
        }) as any;
    },
    getView: (context: WidgetViewContext) => new ArrowHelperView({
        model: context.widget as any,
    }),
}];
