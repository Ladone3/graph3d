import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { Element, NodeDefinition } from '../../../models/graph/graphModel';
import { htmlToImage } from '../../../utils/htmlToSprite';
import { LeftGamepadEditorTool, GamepadEditorToolProps } from './editorTools';
import { EventObject } from '../../../utils';
import { GraphDescriptor } from '../../../models/graph/graphDescriptor';

export interface StateControllerEvents {
    'update': void;
}

export interface LeftCreationToolProps<Descriptor extends GraphDescriptor> extends GamepadEditorToolProps<Descriptor> {
    nodeIdPrefix: string;
}

export class LeftCreationTool<Descriptor extends GraphDescriptor> extends LeftGamepadEditorTool<Descriptor> {
    private node?: NodeDefinition<Descriptor['nodeContentType']>;
    private rootHtml: HTMLElement;
    private container: HTMLElement;
    private idCounter: number;

    constructor(protected props: LeftCreationToolProps<Descriptor>) {
        super(props);
        this.idCounter = 0;

        const rootHtml = document.createElement('DIV');
        rootHtml.style.position = 'fixed';
        rootHtml.style.top = 'calc(50vh - 50px)';
        rootHtml.style.left = 'calc(50vw - 50px)';

        const holder = document.createElement('DIV');
        holder.style.position = 'relative';
        holder.style.width = '100%';
        holder.style.height = '100%';

        const container = document.createElement('DIV');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.backgroundColor = 'black';

        holder.appendChild(container);
        rootHtml.appendChild(holder);
        document.body.appendChild(rootHtml);

        this.container = container;
        this.rootHtml = rootHtml;

        this.props.gamepadHandler.on('keyUp', this.onKeyUp);
        document.body.addEventListener('keyup', () => {
            const map = new Map();
            map.set(this.BUTTON_CONFIG.createButton, undefined);
            this.onKeyUp({eventId: 'keyUp', data: map});
        });

        this.refreshState();
    }

    protected get BUTTON_CONFIG() {
        return {
            pushMock: GAMEPAD_BUTTON.Y,
            pullMock: GAMEPAD_BUTTON.X,
            createButton: GAMEPAD_BUTTON.LEFT_TRIGGER,
        };
    }

    protected onKeyUp = (e: EventObject<'keyUp', Map<GAMEPAD_BUTTON, Element<Descriptor>>>) => {
        if (e.data.has(this.BUTTON_CONFIG.createButton)) {
            this.node.position = this.getTargetPosition();
            this.props.diagramModel.graph.addNodes([this.node]);
            this.refreshState();
        }
    }

    private refreshState() {
        const idNumber = this.idCounter++;

        const node = {
            id: `${this.props.nodeIdPrefix}-${idNumber}`,
            data: {
                label: `New Node ${idNumber}`,
                types: ['l3graph-node'],
            },
            position: {x: 0, y: 0, z: 0},
        };
        ReactDOM.render(
            <div>
                <h3 style={{color: 'blue', fontSize: 24, whiteSpace: 'nowrap'}}>{node.data.label}</h3>
            </div>,
            this.container,
            () => this.onRefreshDone(node)
        );
    }

    private onRefreshDone(node: NodeDefinition<Descriptor['nodeContentType']>) {
        this.rootHtml.style.display = 'block';
        htmlToImage(this.container as HTMLElement).then(img => {
            this.node = node;
            this.display.setImage(img);
            this.rootHtml.style.display = 'none';
            this.render();
        });
    }
}
