import * as React from 'react';
import { DataProvider } from './data/dataProvider';
import { ViewController, ViewControllersSet } from './controllers/viewController';
import { DEFAULT_VIEW_CONTROLLERS_SET } from './controllers/defaultViewControllers';
import { KeyHandler } from './utils/keyHandler';
import { NodeViewTemplate, LinkViewTemplate } from './templates';
import { MouseEditor } from './editors/mouseEditor';
import { DiagramModel } from './models/diagramModel';
import { DiagramView } from './views/diagramView';

export interface L3GraphProps {
    viewOptions?: ViewOptions;
    viewControllers?: ViewControllersSet;
    onComponentMount?: (graph: L3Graph) => void;
    onComponentUnmount?: (graph: L3Graph) => void;
}

export interface ViewOptions {
    nodeTemplates?: {[typeId: string]: NodeViewTemplate };
    linkTemplates?: {[typeId: string]: LinkViewTemplate };
}

export interface State {
    viewController?: ViewController;
}

export class L3Graph extends React.Component<L3GraphProps, State> {
    public model: DiagramModel;
    private keyHandler: KeyHandler;
    private viewControllers: ViewController[] = [];
    private mouseEditor: MouseEditor;

    constructor(props: L3GraphProps) {
        super(props);
        this.model = new DiagramModel();
        this.state = {};
        this.keyHandler = new KeyHandler();
    }

    get viewController() {
        return this.state.viewController;
    }

    set viewController(viewController: ViewController) {
        viewController.refreshCamera();
        this.setState({viewController});
    }

    componentDidMount() {
        if (this.props.onComponentMount) {
            this.props.onComponentMount(this);
        }
        this.keyHandler.on('keyPressed', (event) => this.onKeyPressed(event.data));
    }

    componentWillUnmount() {
        if (this.props.onComponentUnmount) {
            this.props.onComponentUnmount(this);
        }
        this.onBlur();
    }

    private onWheel(e: React.WheelEvent<HTMLDivElement>) {
        this.viewController.onMouseWheel(e.nativeEvent);
    }

    private onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        if (this.mouseEditor.onMouseDown(event.nativeEvent)) {
            this.viewController.onMouseDown(event.nativeEvent);
        }
    }

    private onViewMount = (view: DiagramView) => {
        const controllersSet = this.props.viewControllers || DEFAULT_VIEW_CONTROLLERS_SET;
        this.viewControllers = controllersSet.map(controller => controller(view));
        this.viewController = this.viewControllers[0];
        this.mouseEditor = new MouseEditor(this.model, view);
        this.forceUpdate();
    }

    private onFocus = () => {
        this.keyHandler.switchOn();
    }

    private onBlur = () => {
        this.keyHandler.switchOff();
    }

    private onKeyPressed = (keyMap: Set<number>) => {
        if (this.viewController) {
            this.viewController.onKeyPressed(keyMap);
        }
    }

    render() {
        const viewOptions: ViewOptions = this.props.viewOptions || {};
        return <div
            tabIndex={0}
            className='o3d-main'
            onFocus={this.onFocus}
            onBlur={this.onBlur}>
            <div
                className='o3d-main__touch-panel'
                onMouseDown={event => this.onMouseDown(event)}
                onWheel={event => this.onWheel(event)}>
                <DiagramView
                    model={this.model}
                    onViewMount={this.onViewMount}
                    nodeTemplates={viewOptions.nodeTemplates}
                    linkTemplates={viewOptions.linkTemplates}>
                </DiagramView>
            </div>
            <div className='o3d-toolbar'>
                {this.viewControllers.map((viewController, index) => {
                    return <button
                        key={`controller-button-${index}`}
                        className={this.viewController === viewController ? 'o3d-selected' : ''}
                        onClick={() => { this.viewController = viewController; }}>
                        {viewController.label}
                    </button>;
                })}
            </div>
        </div>;
    }
}
