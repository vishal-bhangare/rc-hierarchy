import React, { FC, useEffect, useState } from 'react'
import { DrawingConfig, DrawingConfigPropI, Coordinates } from '../../entities'

import {
  calcWidth,
  countChilds,
  countLeafNodes,
  getCords,
  getDepth,
  getLines,
  getRandomInt,
  ObjectLen,
  setColorScheme,
  setFont,
  textHeight,
  textWidth,
} from '../../utils'
import { colorPalettes } from '../../colorPalettes'

interface Props {
  data: any
  config?: DrawingConfigPropI
}

const defaultConfig: DrawingConfig = {
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

const Hierarchy: FC<Props> = (props: Props) => {
  const [config, setConfig] = useState<DrawingConfig>({
    ...defaultConfig,
    ...props.config,
    colorScheme: setColorScheme(defaultConfig.colorScheme, props.config?.colorScheme),
  })

  // update config if props.config changes
  useEffect(() => {
    setConfig((config) => ({
      ...config,
      ...props.config,
      colorScheme: setColorScheme(config.colorScheme, props.config?.colorScheme),
    }))
  }, [props.config])

  // re-render canvas if config or props.data changes
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!

    const {
      fontSize,
      fontFamily,
      xt,
      yt,
      ct,
      isCompact,
      maxWid,
      minWid,
      colorScheme,
      strokeWidth,
      boxSpacing,
      boxPadding,
      boxRadius,
      canvasPadding,
    } = config

    const { strokeColor, backgroundColor, textColor, lineColor } = colorScheme

    const data = props.data
    const totalLeafs = countLeafNodes(data, 1, ct, isCompact)
    console.log(totalLeafs)
    const { wid, maxH } = calcWidth(data, 0, 1, 0, 0, ctx, config)

    let newCanvasWidth = wid
    let newCanvasHeight = maxH
    // adding stroke width to canvas width
    if (!isCompact) newCanvasWidth += strokeWidth * totalLeafs
    // adding boxspacing to canvas width
    newCanvasWidth += boxSpacing * 2 * totalLeafs
    // adding boxpadding to canvas width
    newCanvasWidth += boxPadding * 2 * totalLeafs

    //adding canvas padding to canvas width and height
    newCanvasWidth += canvasPadding * 2
    newCanvasHeight += canvasPadding * 2

    canvas!.width = newCanvasWidth
    canvas!.height = newCanvasHeight

    if (isCompact)
      drawObjCompact(
        data,
        1,
        boxSpacing + canvasPadding,
        strokeWidth / 2 + canvasPadding,
        {
          x: 0,
          y: 0,
        },
        0,
        wid,
        0,
      )
    else
      drawObjFull(
        data,
        1,
        boxSpacing + canvasPadding,
        strokeWidth / 2 + canvasPadding,
        {
          x: 0,
          y: 0,
        },
        wid,
        0,
      )

    /**
     * Draws a line between parent and child.
     * @param parent - Coordinates of the parent
     * @param curr - Coordinates of the child.
     * @param curW - Width of the current element.
     * @param curH - Height of the current element.
     * @param parentW - Width of the parent element.
     * @param parentH - Height of the parent element.
     * @param xt - Horizontal spacing between elements.
     * @param yt - Vertical spacing between elements.
     * @param drawCompact - Flag indicating whether to draw in compact mode.
     */
    function drawLine(
      parent: Coordinates,
      curr: Coordinates,
      curW: number,
      curH: number,
      parentW: number,
      parentH: number,
      xt: number,
      yt: number,
      drawCompact: boolean,
    ) {
      // Check if either the parent or child element is empty
      if (!ObjectLen(parent) || !ObjectLen(curr)) return

      // Begin drawing path
      ctx.beginPath()
      // Set line width
      ctx.lineWidth = 2
      // Set line color
      ctx.strokeStyle = lineColor!

      // Draw line based on compact mode
      if (drawCompact) {
        // Compact mode
        ctx.moveTo(parent.x + xt / 2, parent.y + parentH + strokeWidth / 2)
        ctx.lineTo(parent.x + xt / 2, curr.y + curH / 2)
        ctx.lineTo(curr.x - strokeWidth / 2, curr.y + curH / 2)
      } else {
        // Normal mode
        ctx.moveTo(parent.x + parentW / 2, parent.y + parentH + strokeWidth / 2)
        ctx.lineTo(parent.x + parentW / 2, parent.y + (parentH + yt / 2))
        ctx.lineTo(curr.x + curW / 2, parent.y + (parentH + yt / 2))
        ctx.lineTo(curr.x + curW / 2, curr.y - strokeWidth / 2)
      }

      // Stroke the path
      ctx.stroke()
      // Close the path
      ctx.closePath()
    }
    /**
     * Draws a textbox.
     * @param cords - Coordinates of the top-left corner of the textbox.
     * @param height - Height of the rectangle.
     * @param width - Width of the rectangle.
     */
    function drawRect(cords: Coordinates, height: number, width: number) {
      // Begin drawing path
      ctx.beginPath()
      // Set fill color
      ctx.fillStyle = backgroundColor!
      // Draw rounded rectangle
      ctx.roundRect(cords.x, cords.y, width, height, boxRadius)
      // Set stroke color
      ctx.strokeStyle = strokeColor!
      // Set line width
      ctx.lineWidth = strokeWidth
      // Stroke the path
      ctx.stroke()
      // Fill the path
      ctx.fill()
      // Close the path
      ctx.closePath()
    }
    /**
     * Draws text in textbox.
     * @param lines - Array of text lines to draw.
     * @param cords - Coordinates of the top-left corner of the text box.
     * @param lineHeight - Height of each line of text.
     */
    function drawText(lines: string[], cords: Coordinates, lineHeight: number) {
      // Initialize y-coordinate for drawing text
      let y = cords.y
      // Begin drawing path
      ctx.beginPath()
      // Set text fill color
      ctx.fillStyle = textColor!
      // Set text baseline to top
      ctx.textBaseline = 'top'

      // Loop through each line of text
      for (const line of lines) {
        // Draw text at specified coordinates
        ctx.fillText(line, cords.x + boxPadding, y + boxPadding)
        // Fill the text
        ctx.fill()
        // Update y-coordinate for next line of text
        y += lineHeight
      }
      // Close the path
      ctx.closePath()
    }
    /**
     * Draws a full hierarchy diagram recursively on the canvas.
     * @param obj - Object representing the current hierarchy node.
     * @param depth - Current depth level in the hierarchy.
     * @param prevXPos - Previous x-position for drawing elements.
     * @param prevYPos - Previous y-position for drawing elements.
     * @param parent - Coordinates of the parent element.
     * @param parentW - Width of the parent element.
     * @param parentH - Height of the parent element.
     * @returns Object containing updated x and y positions after drawing the hierarchy.
     */
    function drawObjFull(
      obj: object,
      depth: number,
      prevXPos: number,
      prevYPos: number,
      parent: Coordinates,
      parentW: number,
      parentH: number,
    ) {
      // Set font for drawing text
      setFont(ctx, fontFamily, fontSize)

      // Iterate through each child element in the hierarchy
      Object.entries(obj).forEach((elem) => {
        // Calculate the number of leaf nodes for the current element
        const curLeafCount = countLeafNodes({ [elem[0]]: elem[1] }, depth, ct, isCompact)
        // Calculate the width of the current element
        const { wid } = calcWidth({ [elem[0]]: elem[1] }, 0, depth, 0, 0, ctx, config)

        // Calculate text height for the current element
        const textHT = textHeight(elem[0], ctx)

        // Calculate the width of the current element including strokes
        const curWidth = wid + strokeWidth * curLeafCount
        let rectWid = Math.max(minWid, Math.min(maxWid, curWidth))

        // Calculate the number of lines and total height of the text box
        const { lines, lineCount } = getLines(ctx, elem[0], rectWid)
        let rectHeight = textHT * lineCount

        // Add padding to width and height
        rectWid += boxPadding * 2
        rectHeight += boxPadding * 2

        // Calculate the coordinates for drawing the current element
        const cords = getCords(curWidth / 2, prevYPos, prevXPos, rectHeight, rectWid)

        // Draw the rectangle representing the current element
        drawRect(cords, rectHeight, rectWid)

        // Draw a connecting line between the current element and its parent
        if (depth > 1) drawLine(parent, cords, rectWid, rectHeight, parentW, parentH, xt, yt, isCompact)

        // Draw the text inside the rectangle
        drawText(lines, cords, textHT)

        // Check if the current element has child elements
        const childCount = countChilds(Object.keys(elem[1]))
        if (childCount) {
          // Calculate the width of the parent element
          const curWidthT = curWidth

          // Update y-position for next element
          prevYPos += rectHeight + yt

          // Increment depth
          depth += 1

          // Recursively draw child elements
          drawObjFull(elem[1], depth, prevXPos, prevYPos, cords, rectWid, rectHeight)

          // Decrement depth after drawing child elements
          depth -= 1

          // Restore previous y-position
          prevYPos -= rectHeight + yt
          prevXPos += boxSpacing * 2 * curLeafCount
          prevXPos += boxPadding * 2 * curLeafCount
          // Update x-position for next element
          prevXPos += curWidthT
        } else {
          // Update x-position for next element if there are no child elements
          prevXPos += curWidth
          prevXPos += boxSpacing * 2
          prevXPos += boxPadding * 2
        }
      })

      // Return updated x and y positions
      return { prevXPos, prevYPos }
    }

    function drawObjCompact(
      obj: Coordinates,
      depth: number,
      prevXPos: number,
      prevYPos: number,
      parent: Coordinates,
      cDepth: number,
      parentW: number,
      parentH: number,
    ) {
      // Iterate through each child element in the hierarchy
      Object.entries(obj).forEach((elem) => {
        // Calculate the number of leaf nodes for the current element
        const curLeafCount = countLeafNodes({ [elem[0]]: elem[1] }, depth, ct, isCompact)

        // Set font for drawing text
        setFont(ctx, fontFamily, fontSize)

        // Determine if drawing should be in compact mode
        const childCount = countChilds(Object.keys(elem[1]))
        const drawCompact = depth > ct ? true : false

        // Calculate text width and height for the current element
        const textWid = textWidth(elem[0], ctx)
        const textHT = textHeight(elem[0], ctx)

        // Calculate the width of the current element
        const { wid: curWidth } = calcWidth({ [elem[0]]: elem[1] }, 0, depth, cDepth, 0, ctx, config)

        let rectWid = Math.max(minWid, Math.min(maxWid, textWid))
        // Add padding to width and height
        rectWid += boxPadding * 2

        // Calculate the number of lines and total height of the text box
        const { lines, lineCount } = getLines(ctx, elem[0], rectWid)
        let rectHeight = textHT * lineCount
        rectHeight += boxPadding * 2
        // Calculate the current depth of the element
        const curDepth = getDepth(elem[1])

        // Calculate the x-position of the element within compact mode
        const posXCompact = drawCompact ? (curWidth - xt * curDepth) / 2 + cDepth * xt : curWidth / 2 + cDepth * xt

        // Calculate the x-position of the element
        const posX = depth >= ct ? (curWidth - xt * curDepth) / 2 : curWidth / 2

        console.log(elem[0], curWidth, prevXPos)
        // Calculate the coordinates for drawing the current element
        const cords = drawCompact
          ? getCords(
              posXCompact,
              prevYPos,
              prevXPos,
              rectHeight,
              drawCompact ? curWidth - xt * curDepth : rectWid,
              strokeWidth,
            )
          : getCords(
              posX,
              prevYPos,
              prevXPos,
              rectHeight,
              depth >= ct ? curWidth - xt * curDepth : rectWid,
              strokeWidth,
            )
        // Draw the textbox
        drawRect(cords, rectHeight, rectWid)

        // Draw a connecting line between the current element and its parent
        if (depth > 1) drawLine(parent, cords, rectWid, rectHeight, parentW, parentH, xt, yt, drawCompact)

        // Draw the text inside the textbox
        drawText(lines, cords, textHT)

        // Check if the current element has child elements
        if (childCount) {
          // Update y-position for next element
          prevYPos += rectHeight + yt

          // Update the current depth within compact mode
          cDepth = depth >= ct ? cDepth + 1 : 0

          // Store the width of the
          const curWidthT = curWidth
          const parentPrevHeight = prevYPos

          // Increase depth and draw child elements recursively
          depth += 1
          const prevObj = drawObjCompact(elem[1], depth, prevXPos, prevYPos, cords, cDepth, rectWid, rectHeight)
          depth -= 1

          // Adjust positions based on drawing mode
          if (depth >= ct) cDepth = cDepth - 1
          if (!drawCompact) {
            prevYPos = parentPrevHeight - (rectHeight + yt)
            // prevXPos += i == 0 ? curWidthT : prevObj.prevXPos + curWidthT + xt;
            prevXPos += curWidthT
            prevXPos += boxSpacing * 2 * curLeafCount
            prevXPos += boxPadding * 2 * curLeafCount
          } else {
            prevYPos = prevObj.prevYPos
          }
        } else {
          // Update x-position for next element
          if (!drawCompact) {
            prevXPos += curWidth
            prevXPos += boxSpacing * 2
            prevXPos += boxPadding * 2
          } else {
            prevYPos += rectHeight + yt
          }
        }
      })

      // Return the updated x-position, y-position, and maximum compact depth
      return { prevXPos, prevYPos }
    }
  }, [config, props.data])

  return <canvas id='canvas'></canvas>
}
export default Hierarchy
