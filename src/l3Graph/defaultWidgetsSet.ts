import { SelectionWidget } from './models/widgets/selectionWidget';
import { SelectionView } from './views/widgets/selectionView';
import { ArrowHelperView } from './views/widgets/arrowHelperView';
import { ArrowHelper } from './models/widgets/arrowHelper';
import { WidgetFactory } from './models/widgets/widget';
import { GamepadsWidget } from './models/widgets/gamepadsWidget';
import { GamepadsWidgetView } from './views/widgets/gamepadsWidgetView';

export const selectionWidgetFactory: WidgetFactory<SelectionWidget> = {
    getModel: context => new SelectionWidget({
        diagramModel: context.diagramModel,
    }),
    getView: context => new SelectionView({
        model: context.widget,
    }),
};

export const arrowHelperWidgetFactory: WidgetFactory<ArrowHelper> = {
    getModel: context => {
        return new ArrowHelper({mouseHandler: context.mouseHandler});
    },
    getView: context => new ArrowHelperView({
        model: context.widget,
    }),
}

export const gamepadWidgetFactory: WidgetFactory<GamepadsWidget> = {
    getModel: context => {
        return new GamepadsWidget({gamepadHandler: context.gamepadHandler});
    },
    getView: context => new GamepadsWidgetView({
        model: context.widget,
        vrManager: context.vrManager,
    }),
};

export const DEFAULT_MESH_WIDGET_SET: WidgetFactory[] = [
    selectionWidgetFactory,
    arrowHelperWidgetFactory,
    gamepadWidgetFactory,
];
