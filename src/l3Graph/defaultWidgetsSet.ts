import { SelectionWidget } from './models/widgets/selectionWidget';
import { SelectionView } from './views/widgets/selectionView';
import { ArrowHelperView } from './views/widgets/arrowHelperView';
import { ArrowHelper } from './models/widgets/arrowHelper';
import { WidgetFactory } from './models/widgets/widget';
import { GamepadsWidget } from './models/widgets/gamepadsWidget';
import { GamepadsWidgetView } from './views/widgets/gamepadsWidgetView';
import { LeftCreationTool } from './views/widgets/gamepadTools/elementCreationTools';
import { LeftGamepadEditorTool } from './views/widgets/gamepadTools/editorTools';
import { RightGamepadTool, LeftGamepadTool } from './views/widgets/gamepadTools/defaultTools';

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
};

export const gamepadsWidgetFactory: WidgetFactory<GamepadsWidget> = {
    getModel: context => {
        const {gamepadHandler, diagramModel, vrManager} = context;
        return new GamepadsWidget({
            gamepadHandler: context.gamepadHandler,
            leftTools: [
                new LeftGamepadTool({gamepadHandler, vrManager}),
                // new LeftGamepadTool({gamepadHandler, vrManager}),
                // new LeftCreationTool({
                //     gamepadHandler,
                //     diagramModel,
                //     vrManager,
                //     nodeIdPrefix: 'Node-created-by-left-controller-',
                // }),
            ],
            rightTools: [
                new RightGamepadTool({gamepadHandler, vrManager}),
            ],
        });
    },
    getView: context => new GamepadsWidgetView({
        model: context.widget,
        vrManager: context.vrManager,
    }),
};

export const testToolFactory: WidgetFactory<any> = {
    getModel: context => {
        const {gamepadHandler, diagramModel, vrManager} = context;
        return {
            widgetId: 'testToolFactory',
            forceUpdate: () => {/* do nothing */},
            model: new LeftCreationTool({
                gamepadHandler,
                diagramModel,
                vrManager,
                nodeIdPrefix: 'Node-created-by-left-controller-',
            }),
            on: () => {/* do nothing */},
            onAny: () => {/* do nothing */},
            unsubscribe: () => {/* do nothing */},
            unsubscribeFromAll: () => {/* do nothing */},
            trigger: () => {/* do nothing */},
        };
    },
    getView: context => {
        const model: LeftCreationTool = context.widget.model;
        return {
            mesh: model.mesh,
            getBoundingBox: () => undefined,
            update: () => { model.mesh.position.set(0, 0, 0); },
            model: context.widget,
        };
    },
};

export const DEFAULT_MESH_WIDGET_SET: WidgetFactory[] = [
    selectionWidgetFactory,
    arrowHelperWidgetFactory,
    gamepadsWidgetFactory,
    // testToolFactory,
];
