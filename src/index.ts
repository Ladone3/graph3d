require('../styles/main.scss');
require('./js/CSS3DRenderer.js');
require('./js/LoaderSupport.js');
require('./js/OBJLoader.js');
require('./js/OBJLoader2.js');

export { L3Graph, L3GraphProps } from './l3Graph/l3Graph';
export { ViewOptions } from './l3Graph/views/diagramView';
export { Node, NodeModel } from './l3Graph/models/graph/node';
export { Link, LinkModel } from './l3Graph/models/graph/link';
export { NodeDefinition } from './l3Graph/models/graph/graphModel';

export {
    NodeViewTemplate,
    LinkViewTemplate,
    MeshKind,
    L3Mesh,
    MeshObj,
    MeshPrimitive,
    THREE,
    DEFAULT_NODE_TEMPLATE,
    DEFAULT_NODE_TEMPLATE_PROVIDER,
    DEFAULT_LINK_TEMPLATE,
    DEFAULT_LINK_TEMPLATE_PROVIDER,
    NodeTemplateProvider,
    LinkTemplateProvider,
} from './l3Graph/customisation';

export { ViewController } from './l3Graph/controllers/viewController';
export { applyForceLayout3d } from './l3Graph/layout/layouts';
export * from './l3Graph/utils/subscribeable';
export * from './l3Graph/utils/colorUtils';

export {
    Widget as MeshWidget,
    WidgetModelContext,
    WidgetViewContext,
} from './l3Graph/models/widgets/widget';
export { FocusNodeWidget }  from './l3Graph/models/widgets/focusNodeWidget';
export { ReactNodeWidgetView } from './l3Graph/views/widgets/reactNodeWidgetView';
export { DiagramWidgetView } from './l3Graph/views/viewInterface';
export { OverlayPosition } from './l3Graph/views/graph/overlayAnchor';
export * from './l3Graph/defaultWidgetsSet';
