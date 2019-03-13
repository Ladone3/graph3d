import * as React from 'react';
import { ViewController } from './controllers/viewController';
export interface ToolbarProps {
    viewControllers: ReadonlyArray<ViewController>;
    selectedViewController?: ViewController;
    onChangeViewController: (viewController: ViewController) => void;
    onApplyLayout: () => void;
}
export declare class Toolbar extends React.Component<ToolbarProps> {
    constructor(props: ToolbarProps);
    componentDidMount(): void;
    setViewController(selectedViewController: ViewController): void;
    render(): JSX.Element;
}
