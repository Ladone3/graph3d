import * as React from 'react';

export class DefaultNodeOverlay extends React.Component<{label: string}> {
    render() {
        const {label} = this.props;
        return <div className='l3graph-default-node-view'>
            {label}
        </div>;
    }
}

export function createContextProvider(context: any): React.ComponentClass {
    class ContextProvider extends React.Component {
        public static childContextTypes: any;
        getChildContext() {
            return context;
        }
        render() {
            return <div>{this.props.children}</div>;
        }
    }
    ContextProvider.childContextTypes = {};
    Object.keys(context).forEach(key => {
        ContextProvider.childContextTypes[key] = React.PropTypes.any.isRequired;
    });
    return ContextProvider;
}
