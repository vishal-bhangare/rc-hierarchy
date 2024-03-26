import { colorPalettes } from './colorPalettes'
import { DrawingConfig } from './entities'
import { getRandomInt } from './utils'

export const defaultConfig: DrawingConfig = {
  isCompact: false,
  fontSize: 16,
  fontFamily: 'Arial',
  xt: 30,
  yt: 30,
  ct: 3,
  maxWid: 100,
  minWid: 50,
  strokeWidth: 3,
  boxSpacing: 15,
  boxPadding: 4,
  boxRadius: 5,
  canvasPadding: 20,
  colorScheme: colorPalettes[getRandomInt(0, colorPalettes.length - 1)],
}
