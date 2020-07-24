import * as React from 'react';
import { ViewController, ViewControllersSet } from './controllers/viewController';

export interface ToolbarProps {
    viewControllers: ReadonlyArray<ViewController>;
    selectedViewController?: ViewController;
    onChangeViewController: (viewController: ViewController) => void;
    onApplyLayout: () => void;
}

export class Toolbar extends React.Component<ToolbarProps> {
    constructor(props: ToolbarProps) {
        super(props);
        this.state = {
            selectedViewController: undefined,
        };
    }

    componentDidMount() {
        this.setState({
            selectedViewController: this.props.selectedViewController,
        });
    }

    setViewController(selectedViewController: ViewController) {
        this.setState({selectedViewController});
        if (typeof this.props.onChangeViewController === 'function') {
            this.props.onChangeViewController(selectedViewController);
        }
    }

    render() {
        const {viewControllers, onApplyLayout} = this.props;
        return <div className='l3graph-toolbar'>
            <button
                title='Help'
                onClick={() => { alert(HELP_TEXT); }}>
                <h2 style={{margin: 0}}>?</h2>
            </button>
            {viewControllers.map((viewController, index) => {
                return <button
                    title={viewController.label}
                    key={`controller-button-${index}`}
                    onClick={() => { this.setViewController(viewController); }}>
                    {viewController.label[0]}
                </button>;
            })}
            <button
                id='l3graph-force-layout-button'
                title='Force layout'
                onClick={() => { onApplyLayout(); }}>
                FL
            </button>
        </div>;
    }
}

const HELP_TEXT = `Next three buttons provide three ways of navigation in 3D space!
Hold mouse over the button to see full name of view controller. Use mouse and keyboard arrows for navigation
S (Spherical view controller) - Camera is moving around the center of the diagram.
C (Cylindrical view controller) - Camera is moving around the pivot which is placed in the center of the diagram.
O (Open space view controller) - You can move in any direction. Change the view direction my mouse dragging,
and change the position by using keyboard arrows.`;
