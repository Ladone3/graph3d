import { Node } from '../models/graph/node';
import { GamepadHandler } from '../vrUtils/gamepadHandler';

export class GamepadEditor {
    constructor(private gamepadHandler: GamepadHandler) {
        this.gamepadHandler.on('elementDrag', event => {
            const { target, position } = event.data;
            if (target instanceof Node) {
                target.setPosition(position);
            }
        });
    }
}
