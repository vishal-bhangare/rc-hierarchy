import { ColorScheme, Coordinates, DrawingConfig } from './entities'
/**
 * Calculates the coordinates for textbox.
 * @param x - The x-coordinate of the point.
 * @param y - The y-coordinate of the point.
 * @param prevWidth - Previous width value.
 * @param _height - Ignored height value.
 * @param width - Width value.
 * @param strokeWidth - Optional stroke width value.
 * @returns The calculated coordinates.
 */
export function getCords(
  x: number,
  y: number,
  prevWidth: number,
  _height: number,
  width: number,
  strokeWidth: number = 0,
): Coordinates {
  const xPos: number = x - Math.floor(width / 2) + prevWidth + strokeWidth / 2
  const yPos: number = y
  return { x: xPos, y: yPos }
}

/**
 * Calculates the depth of an object.
 * @param obj - The object to calculate depth for.
 * @returns The depth of the object.
 */
export function getDepth(obj: any): number {
  let depth: number = 0
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === 'object') {
      const currentDepth: number = 1 + getDepth(obj[key])
      depth = Math.max(depth, currentDepth)
    }
  }
  return depth
}

/**
 * Counts the number of leaf nodes in an object tree.
 * @param obj - The object to count leaf nodes for.
 * @param depth - Current depth.
 * @param ct - Maximum depth to consider.
 * @param isCompact - Flag indicating drawing mode.
 * @returns The count of leaf nodes.
 */
export function countLeafNodes(obj: any, depth: number, ct: number, isCompact = false): number {
  let count = 0
  for (const key in obj) {
    if (Object.keys(obj[key]).length === 0) {
      count++
      // console.log(key, depth);
    } else {
      depth += 1
      count += countLeafNodes(obj[key], depth, ct, isCompact)
      depth -= 1
    }
    if (isCompact && depth > ct) {
      return count
    }
  }
  return count
}
/**
 * Counts the number of children of an object.
 * @param obj - The object to count children for.
 * @returns The count of children.
 */
export function countChilds(obj: any): number {
  return Object.keys(obj).length
}

/**
 * Returns the length of an object.
 * @param obj - The object to calculate the length for.
 * @returns The length of the object.
 */
export function ObjectLen(obj: any): number {
  return Object.keys(obj).length
}

/**
 * Generates a random integer between the specified minimum and maximum values (inclusive).
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @returns A random integer within the specified range.
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Splits a string of text into multiple lines based on a maximum width.
 * @param ctx - The CanvasRenderingContext2D object.
 * @param text - The text to split.
 * @param maxWidth - The maximum width for each line.
 * @returns An object containing the count of lines and an array of the split lines.
 */
export function getLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): { lineCount: number; lines: string[] } {
  const words: string[] = text.split(' ')
  let line: string = ''
  let lineCount: number = 0
  let i: number
  let temp: string
  let metrics: TextMetrics
  const lines: string[] = []

  for (i = 0; i < words.length; i++) {
    temp = words[i]
    metrics = ctx.measureText(temp)

    while (metrics.width > maxWidth) {
      temp = temp.substring(0, temp.length - 1)
      metrics = ctx.measureText(temp)
    }

    if (words[i] != temp) {
      words.splice(i + 1, 0, words[i].substr(temp.length))
      words[i] = temp
    }

    temp = line + words[i] + ' '
    metrics = ctx.measureText(temp)

    if (metrics.width > maxWidth && i > 0) {
      lines.push(line)
      line = words[i] + ' '
      lineCount++
    } else {
      line = temp
    }
  }

  lineCount++
  lines.push(line)
  return { lineCount, lines }
}

/**
 * Measures the width of a given text string.
 * @param text - The text string to measure.
 * @param ctx - The CanvasRenderingContext2D object.
 * @returns The width of the text.
 */
export function textWidth(text: string, ctx: CanvasRenderingContext2D): number {
  return parseInt(ctx.measureText(text).width.toFixed(2))
}

/**
 * Measures the height of a given text string.
 * @param text - The text string to measure.
 * @param ctx - The CanvasRenderingContext2D object.
 * @returns The height of the text.
 */
export function textHeight(text: string, ctx: CanvasRenderingContext2D): number {
  const metrics = ctx.measureText(text)
  const height = metrics?.actualBoundingBoxAscent + metrics?.actualBoundingBoxDescent
  return height
}

/**
 * Calculates the width of an object.
 * @param prevObj - The object to calculate the width for.
 * @param wid - Current width value.
 * @param depth - Current depth.
 * @param isCompact - Flag indicating drawing mode.
 * @param cDepth - Current depth of child nodes.
 * @param maxi - Maximum width encountered.
 * @param ctx - The CanvasRenderingContext2D object.
 * @param config - Drawing configuration.
 * @param prevH - Previous height value.
 * @param height - Maximum height encountered.
 * @returns An object containing calculated width, maximum width, maximum height and previous height.
 */
export function calcWidth(
  obj: any,
  wid: number,
  depth: number,
  cDepth: number,
  maxi: number,
  ctx: CanvasRenderingContext2D,
  config: DrawingConfig,
  prevH: number = 0,
  height: number = 0,
): { wid: number; height: number; maxi: number; prevH: number } {
  const { fontFamily, fontSize, isCompact, ct, maxWid, minWid, boxPadding, xt, yt } = config

  setFont(ctx, fontFamily, fontSize)

  Object.entries(obj).forEach((elem) => {
    const childCnt: number = countChilds(elem[1])
    const drawCompact: boolean = isCompact && depth > ct ? true : false
    let curWid: number = Math.max(minWid, Math.min(textWidth(elem[0], ctx), maxWid))
    const textHT: number = textHeight(elem[0], ctx)
    const { lineCount } = getLines(ctx, elem[0], curWid)
    let curH: number = textHT * lineCount

    // curWid += boxSpacing * 2;
    curH += boxPadding * 2
    // curWid += strokeWidth * curLeafCount;
    if (isCompact) curWid += cDepth * xt
    if (!drawCompact) maxi = 0
    maxi = Math.max(curWid, maxi)
    height = Math.max(height, prevH + curH)

    if (isCompact) prevH += curH + yt

    if (childCnt) {
      if (!isCompact) prevH += curH + yt
      cDepth = depth >= ct ? cDepth + 1 : 0
      const parentPrevH: number = prevH
      depth += 1
      const prevObj = calcWidth(elem[1], 0, depth, cDepth, maxi, ctx, config, prevH, height)
      depth -= 1

      if (depth >= ct) cDepth = cDepth - 1

      if (drawCompact) {
        wid = prevObj.wid
      } else {
        wid = wid + prevObj.wid
      }
      maxi = prevObj.maxi
      prevH = !drawCompact ? parentPrevH - (curH + yt) : prevObj.prevH
      height = prevObj.height
    } else {
      if (drawCompact) wid = Math.max(curWid, maxi)
      else wid += curWid
    }
  })
  return { wid, height, maxi, prevH }
}

/**
 * Sets the font style for text rendering.
 * @param ctx - The CanvasRenderingContext2D object.
 * @param fontFamily - The font family.
 * @param fontSize - The font size.
 */
export function setFont(ctx: CanvasRenderingContext2D, fontFamily: string, fontSize: number): void {
  ctx.font = `${fontSize}px ${fontFamily}`
}

/**
 * Merges two color schemes.
 * @param curColorSchme - The current color scheme.
 * @param newColorSchme - The new color scheme.
 * @returns The merged color scheme.
 */
export function setColorScheme(curColorSchme: ColorScheme, newColorSchme: ColorScheme | any) {
  for (const prop in newColorSchme) {
    if (Object.prototype.hasOwnProperty.call(curColorSchme, prop)) {
      curColorSchme[prop as keyof ColorScheme] = newColorSchme[prop as keyof ColorScheme]
    }
  }
  return curColorSchme
}
