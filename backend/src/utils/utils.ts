import { ColorType } from "../chess/game/types"

const log = console.log

const invertColor = (currentColor: ColorType) => currentColor === 'w' ? 'b' : 'w';

export {
  log,
  invertColor,
}

