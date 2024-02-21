import { FC, useEffect, useState } from 'react'
import { DrawingSettings, Coordinates } from '../../entities'

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
  setFont,
  textHeight,
  textWidth,
} from '../../utils'
import React from 'react'

export const colorPalettes = [
  ['#26C6DA', '#004851', '#00282E'],
  ['#2E78D2', '#112E51', '#081627'],
  ['#FF7043', '#853A22', '#5D2818'],
  ['#78909C', '#364850', '#222C31'],
]

interface Props {
  data: any
}

const Hierarchy: FC<Props> = ({ data }: Props) => {
  // const canvasRef = useRef<HTMLCanvasElement>();
  const [options, setOptions] = useState<DrawingSettings>({
    fontSize: 20,
    fontFamily: 'Arial',
    xt: 30,
    yt: 30,
    ct: 3,
    isCompact: true,
    maxWid: 100,
    minWid: 50,
    strokeColor: '#78909C',
    strokeWidth: 3,
    boxSpacing: 5,
    boxPadding: 4,
    boxRadius: 5,
    canvasPadding: 20,
  })

  // let data = data1;
  useEffect(() => {
    // const canvas = canvasRef.current;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!

    const curColor = colorPalettes[getRandomInt(0, 3)]

    setOptions((options) => ({ ...options, strokeColor: curColor[1] }))

    const {
      fontSize,
      fontFamily,
      xt,
      yt,
      ct,
      isCompact,
      maxWid,
      minWid,
      strokeColor,
      strokeWidth,
      boxSpacing,
      boxPadding,
      boxRadius,
      canvasPadding,
    } = options

    const totalLeafs = countLeafs(data, 0, 1, isCompact, ct)
    const { wid, maxH } = calcWidth(data, 0, 1, isCompact, 0, 0, ctx, options)
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
      ctx.strokeStyle = curColor[2]

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
      ctx.fillStyle = curColor[0]
      ctx.roundRect(cords.x, cords.y, width, height, boxRadius)
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.stroke()
      ctx.fill()
      ctx.closePath()
    }

    function drawText(lines: string[], cords: Coordinates, lineHeight: number) {
      let y = cords.y
      ctx.beginPath()
      ctx.fillStyle = 'black'
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
        const { wid } = calcWidth({ [elem[0]]: elem[1] }, 0, depth, false, 0, 0, ctx, options)

        const textWid = textWidth(elem[0], ctx)
        const textHT = textHeight(elem[0], ctx)

        const curWidth = wid + strokeWidth * curLeafCount
        let rectWid = Math.max(minWid, Math.min(maxWid, textWid))

        const { lines, lineCount } = getLines(ctx, elem[0], rectWid)
        let rectHeight = textHT * lineCount

        rectWid += boxPadding * 2
        rectHeight += boxPadding * 2

        const cords = getCords(curWidth / 2, prevYPos, prevXPos, rectHeight, rectWid)

        drawRect(cords, rectHeight, rectWid)
        if (depth > 1) drawLine(parent, cords, rectWid, rectHeight, parentW, parentH, xt, yt, isCompact)
        drawText(lines, cords, textHT)
        console.log(elem[0], curWidth, curLeafCount, cords)
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
          prevXPos += curWidth + boxSpacing
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

        const { wid } = calcWidth({ [elem[0]]: elem[1] }, 0, depth, isCompact, cDepth, 0, ctx, options)
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
        // console.log(elem[0], cords, curWidth, rectHeight)
        drawRect(cords, rectHeight, rectWid)
        if (depth > 1) drawLine(parent, cords, rectWid, rectHeight, parentW, parentH, xt, yt, drawCompact)
        drawText(lines, cords, textHT)
        // console.log(elem[0], lineCount, rectWid)
        // console.log("--------------------------")

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
            prevXPos = prevObj.prevXPos
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
  }, [])

  return <canvas id='canvas'></canvas>
}
export default Hierarchy
