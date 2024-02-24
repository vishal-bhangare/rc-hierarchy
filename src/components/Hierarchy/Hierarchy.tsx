import React, { FC, useEffect, useState } from 'react'
import { DrawingConfig, DrawingConfigPropI, Coordinates } from '../../entities'

import {
  calcWidth,
  countChilds,
  countLeafs,
  getCords,
  getDepth,
  getLines,
  getRandomInt,
  getSibCount,
  ObjectLen,
  setColorScheme,
  setFont,
  textHeight,
  textWidth,
} from '../../utils'

export const colorPalettes = [
  {
    strokeColor: '#00B395',
    backgroundColor: '#DDF6F2',
    lineColor: '#379188',
    textColor: '#000',
  },
  {
    strokeColor: '#9D6780',
    backgroundColor: '#EDDFE5',
    lineColor: '#990035',
    textColor: '#000',
  },
  {
    strokeColor: '#FF6384',
    backgroundColor: '#FFE3E9',
    lineColor: '#A8718A',
    textColor: '#000',
  },
  {
    strokeColor: '#4BC0C0',
    backgroundColor: '#D9E5E1',
    lineColor: '#45826F',
    textColor: '#000',
  },
  {
    strokeColor: '#FF9F40',
    backgroundColor: '#F5E1DC',
    lineColor: '#A56B5C',
    textColor: '#000',
  },
  {
    strokeColor: '#9966FF',
    backgroundColor: '#D5E9F1',
    lineColor: '#27849E',
    textColor: '#000',
  },
  {
    strokeColor: '#A4B0C6',
    backgroundColor: '#eee',
    lineColor: '#8f9bb1',
    textColor: '#000',
  },
]

interface Props {
  data: any
  config?: DrawingConfigPropI
}

const defaultConfig: DrawingConfig = {
  fontSize: 16,
  fontFamily: 'Arial',
  xt: 30,
  yt: 30,
  ct: 3,
  isCompact: true,
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
    colorScheme: setColorScheme(defaultConfig.colorScheme, props.config!.colorScheme!),
  })

  useEffect(() => {
    setConfig((config) => ({
      ...config,
      ...props.config,
      colorScheme: setColorScheme(config.colorScheme, props.config!.colorScheme!),
    }))
  }, [props.config])
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
    const totalLeafs = countLeafs(data, 0, 1, isCompact, ct)
    const { wid, maxH } = calcWidth(data, 0, 1, isCompact, 0, 0, ctx, config)
    let newCanvasWidth = wid
    newCanvasWidth += strokeWidth * totalLeafs // adding stroke width to canvas width
    newCanvasWidth += boxSpacing * totalLeafs + boxSpacing // adding box-spacing to canvas width and 1 pt of boxSpacing to compensate last node
    newCanvasWidth += canvasPadding * 2
    const newCanvasHeight = maxH + canvasPadding * 2 + strokeWidth

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
      if (!ObjectLen(parent) || !ObjectLen(curr)) return
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = lineColor!

      if (drawCompact) {
        ctx.moveTo(parent.x + xt / 2, parent.y + parentH + strokeWidth / 2)
        ctx.lineTo(parent.x + xt / 2, curr.y + curH / 2)
        ctx.lineTo(curr.x - strokeWidth / 2, curr.y + curH / 2)
      } else {
        ctx.moveTo(parent.x + parentW / 2, parent.y + parentH + strokeWidth / 2)
        ctx.lineTo(parent.x + parentW / 2, parent.y + (parentH + yt / 2))
        ctx.lineTo(curr.x + curW / 2, parent.y + (parentH + yt / 2))
        ctx.lineTo(curr.x + curW / 2, curr.y - strokeWidth / 2)
      }

      ctx.stroke()
      ctx.closePath()
    }

    function drawRect(cords: Coordinates, height: number, width: number) {
      ctx.beginPath()
      ctx.fillStyle = backgroundColor!
      ctx.roundRect(cords.x, cords.y, width, height, boxRadius)
      ctx.strokeStyle = strokeColor!
      ctx.lineWidth = strokeWidth
      ctx.stroke()
      ctx.fill()
      ctx.closePath()
    }

    function drawText(lines: string[], cords: Coordinates, lineHeight: number) {
      let y = cords.y
      ctx.beginPath()
      ctx.fillStyle = textColor!
      ctx.textBaseline = 'top'

      for (const line of lines) {
        ctx.fillText(line, cords.x + boxPadding, y + boxPadding)
        ctx.fill()
        y += lineHeight
      }
      ctx.closePath()
    }

    function drawObjFull(
      obj: object,
      depth: number,
      prevXPos: number,
      prevYPos: number,
      parent: Coordinates,
      parentW: number,
      parentH: number,
    ) {
      setFont(ctx, fontFamily, fontSize)
      Object.entries(obj).forEach((elem) => {
        const curLeafCount = Math.max(1, countLeafs(elem[1], 0, depth, false, ct))
        const { wid } = calcWidth({ [elem[0]]: elem[1] }, 0, depth, false, 0, 0, ctx, config)

        const textHT = textHeight(elem[0], ctx)

        const curWidth = wid + strokeWidth * curLeafCount
        let rectWid = Math.max(minWid, Math.min(maxWid, curWidth))

        const { lines, lineCount } = getLines(ctx, elem[0], rectWid)
        let rectHeight = textHT * lineCount

        rectWid += boxPadding * 2
        rectHeight += boxPadding * 2

        const cords = getCords(curWidth / 2, prevYPos, prevXPos, rectHeight, rectWid)

        drawRect(cords, rectHeight, rectWid)
        if (depth > 1) drawLine(parent, cords, rectWid, rectHeight, parentW, parentH, xt, yt, isCompact)
        drawText(lines, cords, textHT)
        const childCount = countChilds(Object.keys(elem[1]))
        if (childCount) {
          const parentWidth = curWidth
          prevYPos += rectHeight + yt
          depth += 1
          drawObjFull(elem[1], depth, prevXPos, prevYPos, cords, rectWid, rectHeight)
          depth -= 1
          prevYPos -= rectHeight + yt
          // prevYPos = prevObj.prevYPos;
          prevXPos += parentWidth + boxSpacing * curLeafCount
        } else {
          prevXPos += rectWid + boxSpacing
        }
      })

      return { prevXPos, prevYPos }
    }

    function drawObjCompact(
      obj: Coordinates,
      depth: number,
      prevXPos: number,
      prevYPos: number,
      parent: Coordinates,
      cDepth: number,
      maxCDepth: number,
      parentW: number,
      parentH: number,
    ) {
      Object.entries(obj).forEach((elem, i) => {
        const curLeafCount = Math.max(1, countLeafs({ [elem[0]]: elem[1] }, 0, depth, isCompact, ct))
        const siblingsCount = getSibCount(elem[0], obj)

        setFont(ctx, fontFamily, fontSize)
        const childCount = countChilds(Object.keys(elem[1]))
        const drawCompact = depth != ct - 1 && (depth > ct || siblingsCount > 1) ? true : false

        const textWid = textWidth(elem[0], ctx)
        const textHT = textHeight(elem[0], ctx)

        const { wid } = calcWidth({ [elem[0]]: elem[1] }, 0, depth, isCompact, cDepth, 0, ctx, config)
        const curWidth = wid + strokeWidth * curLeafCount
        let rectWid = Math.max(minWid, Math.min(maxWid, textWid))
        const { lines, lineCount } = getLines(ctx, elem[0], rectWid)
        let rectHeight = textHT * lineCount

        rectWid += boxPadding * 2
        rectHeight += boxPadding * 2

        const curDepth = getDepth(elem[1])
        const prevMaxCDepth = maxCDepth
        if (!drawCompact) maxCDepth = 0

        const posXCompact = drawCompact ? (curWidth - xt * curDepth) / 2 + cDepth * xt : curWidth / 2 + cDepth * xt

        const posX = depth == ct || childCount > 2 ? (curWidth - xt * curDepth) / 2 : curWidth / 2

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
              depth == ct || childCount > 2 ? curWidth - xt * curDepth : rectWid,
              strokeWidth,
            )
        drawRect(cords, rectHeight, rectWid)
        if (depth > 1) drawLine(parent, cords, rectWid, rectHeight, parentW, parentH, xt, yt, drawCompact)
        drawText(lines, cords, textHT)

        if (childCount) {
          prevYPos += rectHeight + yt
          cDepth = depth > 1 && (depth >= ct || drawCompact || childCount > 2) ? cDepth + 1 : 0

          maxCDepth = Math.max(cDepth, maxCDepth)
          const curWidthT = curWidth
          const parentPrevHeight = prevYPos

          depth += 1
          const prevObj = drawObjCompact(
            elem[1],
            depth,
            prevXPos,
            prevYPos,
            cords,
            cDepth,
            maxCDepth,
            rectWid,
            rectHeight,
          )
          depth -= 1
          //
          maxCDepth = prevObj.maxCDepth
          if (depth >= ct || drawCompact || childCount > 2) cDepth = cDepth - 1
          if (!drawCompact) {
            maxCDepth += prevMaxCDepth
            prevYPos = parentPrevHeight - (rectHeight + yt)
            prevXPos += i == 0 ? curWidthT : prevObj.prevXPos + curWidthT + xt
            prevXPos += boxSpacing * curLeafCount
          } else {
            prevYPos = prevObj.prevYPos
          }
        } else {
          if (!drawCompact) {
            prevXPos += curWidth
            prevXPos += boxSpacing * curLeafCount // box spacing
            maxCDepth += prevMaxCDepth
          } else prevYPos += rectHeight + yt
        }
      })

      return { prevXPos, prevYPos, maxCDepth }
    }
  }, [config, props.data])

  return <canvas id='canvas'></canvas>
}
export default Hierarchy
