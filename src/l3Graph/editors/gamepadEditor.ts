import { Node } from '../models/graph/node';
import { GamepadHandler } from '../vrUtils/gamepadHandler';
import { GraphDescriptor } from '../models/graph/graphDescriptor';

export class GamepadEditor<Descriptor extends GraphDescriptor> {
    constructor(private gamepadHandler: GamepadHandler<Descriptor>) {
        this.gamepadHandler.on('elementDrag', event => {
            const { target, position } = event.data;
            if (target instanceof Node) {
                target.setPosition(position);
            }
        });
    }
}
