import { SelectionWidget } from './models/widgets/selectionWidget';
import { ArrowHelper } from './models/widgets/arrowHelper';
import { WidgetFactory } from './models/widgets/widget';
import { GamepadsWidget } from './models/widgets/gamepadsWidget';
export declare const selectionWidgetFactory: WidgetFactory<SelectionWidget>;
export declare const arrowHelperWidgetFactory: WidgetFactory<ArrowHelper>;
export declare const gamepadsWidgetFactory: WidgetFactory<GamepadsWidget>;
export declare function DEFAULT_MESH_WIDGET_SET(): WidgetFactory<any>[];
