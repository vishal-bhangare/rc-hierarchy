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
 * @param cnt - Current count of leaf nodes.
 * @param depth - Current depth.
 * @param isc - Flag indicating drawing mode.
 * @param ct - Maximum depth to consider.
 * @returns The count of leaf nodes.
 */
export function countLeafs(obj: any, cnt: number, depth: number, isc: boolean, ct: number): number {
  Object.entries(obj).forEach((child) => {
    if (countChilds(child[1])) {
      if (depth == ct - 1 && isc) {
        cnt += countChilds(child[1]) == 2 ? 2 : 1
      }
      depth += 1
      cnt = countLeafs(child[1], cnt, depth, isc, ct)
      depth -= 1
    } else {
      if (!isc) cnt += 1
    }
  })
  return cnt
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
 * Returns the number of siblings of a given node in a tree structure.
 * @param nodeKey - The key of the node.
 * @param data - The data representing the tree.
 * @returns The number of siblings of the node.
 */
export function getSibCount(nodeKey: string, data: any): number {
  const parentNode = getParentNode(nodeKey, data)

  if (parentNode) {
    return Object.keys(parentNode).filter((key) => key !== nodeKey).length
  } else {
    return 0 // Node has no parent, so it has no siblings
  }
}

/**
 * Finds and returns the parent node of a given node in a tree structure.
 * @param nodeKey - The key of the node whose parent is to be found.
 * @param data - The data representing the tree.
 * @returns The parent node of the given node.
 */
export function getParentNode(nodeKey: string, data: any): any {
  let parentNode: any = null

  function traverse(obj: any) {
    if (obj && typeof obj === 'object') {
      if (nodeKey in obj) {
        parentNode = obj
      } else {
        for (const key in obj) {
          traverse(obj[key])
        }
      }
    }
  }

  traverse(data)
  return parentNode
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
  return metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
}

/**
 * Calculates the width of an object.
 * @param obj - The object to calculate the width for.
 * @param wid - Current width value.
 * @param depth - Current depth.
 * @param isc - Flag indicating drawing mode.
 * @param cDepth - Current depth of child nodes.
 * @param maxi - Maximum width encountered.
 * @param ctx - The CanvasRenderingContext2D object.
 * @param config - Drawing configuration.
 * @param prevH - Previous height value.
 * @param maxH - Maximum height encountered.
 * @returns An object containing calculated width, maximum width, maximum height and previous height.
 */
export function calcWidth(
  obj: any,
  wid: number,
  depth: number,
  isc: boolean,
  cDepth: number,
  maxi: number,
  ctx: CanvasRenderingContext2D,
  config: DrawingConfig,
  prevH: number = 0,
  maxH: number = 0,
): { wid: number; maxi: number; maxH: number; prevH: number } {
  const { fontFamily, fontSize, isCompact, ct, maxWid, minWid, boxPadding, xt, yt } = config

  setFont(ctx, fontFamily, fontSize)

  Object.entries(obj).forEach((child) => {
    const sibcnt: number = getSibCount(child[0], obj)
    const childCnt: number = countChilds(child[1])
    const drawCompact: boolean = isCompact && depth != ct - 1 && (depth > ct || sibcnt > 1) ? true : false

    let curWid: number = Math.max(minWid, Math.min(textWidth(child[0], ctx), maxWid))
    const textHT: number = textHeight(child[0], ctx)
    const { lineCount } = getLines(ctx, child[0], curWid)
    let curH: number = textHT * lineCount

    curWid += boxPadding * 2
    curH += boxPadding * 2

    if (isc) curWid += cDepth * xt
    if (!drawCompact) maxi = 0
    maxi = Math.max(curWid, maxi)
    maxH = Math.max(maxH, prevH + curH)

    if (isCompact) prevH += curH + yt

    if (childCnt) {
      if (!isCompact) prevH += curH + yt
      cDepth = depth > 1 && (depth >= ct || drawCompact || childCnt > 2) ? cDepth + 1 : 0
      const parentPrevH: number = prevH
      depth += 1
      obj = calcWidth(child[1], 0, depth, isc, cDepth, maxi, ctx, config, prevH, maxH)
      depth -= 1

      if (depth >= ct || drawCompact || childCnt > 2) cDepth = cDepth - 1

      wid = drawCompact ? obj.wid : wid + obj.wid
      maxi = obj.maxi
      prevH = !drawCompact ? parentPrevH - (curH + yt) : obj.prevH
      maxH = obj.maxH
    } else {
      if (isc && drawCompact) wid = Math.max(curWid, maxi)
      else wid += curWid
    }
  })

  return { wid, maxi, maxH, prevH }
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
