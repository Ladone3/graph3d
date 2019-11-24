import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { KeyHandler } from '../../utils';
import { LeftGamepadEditorTool } from './gamepadTools/editorTools';
import { Widget } from '../../models/widgets/widget';

export const SELECTION_PADDING = 5;

export interface StateTesterViewParameters {
    keyHandler: KeyHandler;
}

export class StateTesterModel extends Widget {
    constructor(public parameters: StateTesterViewParameters) {
        super();
        parameters.keyHandler.on('keyUp', () => {
            setTimeout(() => this.forceUpdate(), 100);
        });
    }
}

export class StateTesterView implements DiagramWidgetView {
    private editorTool: LeftGamepadEditorTool;
    mesh: THREE.Group;
    model: StateTesterModel;

    constructor({model}: {model: StateTesterModel}) {
        this.editorTool = new LeftGamepadEditorTool({
            gamepadHandler: model.parameters.keyHandler as any,
            diagramModel: undefined,
            vrManager: undefined,
        });
        this.mesh = this.editorTool.mesh;

        this.update();
    }

    getBoundingBox(): THREE.Box3 {
        return undefined;
    }

    public update() {
        /* */
    }
}
