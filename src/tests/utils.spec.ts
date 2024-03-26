import {
  getDepth,
  countLeafNodes,
  countChilds,
  ObjectLen,
  getRandomInt,
  getLines,
  textWidth,
  textHeight,
  calcWidth,
} from '../utils'
import { defaultConfig } from '../config'

describe('getDepth function', () => {
  it('should return the correct depth of the object', () => {
    const obj = {
      a: {
        b: {
          c: {},
        },
        d: {},
      },
    }

    expect(getDepth(obj)).toBe(3)
  })

  it('should return 0 for an empty object', () => {
    const obj = {}
    expect(getDepth(obj)).toBe(0)
  })
})

describe('countLeafNodes function for Compact form', () => {
  it('should return the correct count of leaf nodes', () => {
    const obj = {
      a: {
        b: {
          c: {},
        },
        d: {},
      },
      e: {},
    }
    expect(countLeafNodes(obj, 1, 1, true)).toBe(2)
  })

  it('should return 0 for an empty object', () => {
    const obj = {}
    expect(countLeafNodes(obj, 1, 1, true)).toBe(0)
  })
})

describe('countLeafNodes function for Normal form', () => {
  it('should return the correct count of leaf nodes', () => {
    const obj = {
      a: {
        b: {
          c: {
            e: {},
            f: {},
          },
        },
        d: { k: {}, l: {} },
      },
      e: {},
    }
    expect(countLeafNodes(obj, 1, 1, false)).toBe(5)
  })

  it('should return 0 for an empty object', () => {
    const obj = {}
    expect(countLeafNodes(obj, 1, 1, false)).toBe(0)
  })
})

describe('countChilds function', () => {
  it('should return the correct count of children', () => {
    const obj = {
      a: {
        b: {},
        c: {},
      },
      d: {},
    }
    expect(countChilds(obj)).toBe(2)
  })

  it('should return 0 for an empty object', () => {
    const obj = {}
    expect(countChilds(obj)).toBe(0)
  })
})

describe('ObjectLen function', () => {
  it('should return the correct length of the object', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    }
    expect(ObjectLen(obj)).toBe(3)
  })

  it('should return 0 for an empty object', () => {
    const obj = {}
    expect(ObjectLen(obj)).toBe(0)
  })
})

describe('getRandomInt function', () => {
  it('should generate a random integer within the specified range', () => {
    const min = 0
    const max = 10
    const randomInt = getRandomInt(min, max)
    expect(randomInt).toBeGreaterThanOrEqual(min)
    expect(randomInt).toBeLessThanOrEqual(max)
    expect(Number.isInteger(randomInt)).toBe(true)
  })
})

describe('getLines function', () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CanvasRenderingContext2D not supported')

  it('should split text into multiple lines based on maxWidth', () => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    const maxWidth = 100
    const expectedResult = {
      lineCount: 3,
      lines: ['Lorem ipsum dolor sit ', 'amet, consectetur ', 'adipiscing elit. '],
    }
    expect(getLines(ctx, text, maxWidth)).toEqual(expectedResult)
  })

  it('should return a single line if maxWidth is larger than text width', () => {
    const text = 'Lorem ipson'
    const maxWidth = 100
    const expectedResult = {
      lineCount: 1,
      lines: ['Lorem ipson '],
    }
    expect(getLines(ctx, text, maxWidth)).toEqual(expectedResult)
  })

  it('should return an empty array if text is empty', () => {
    const text = ''
    const maxWidth = 100
    const expectedResult = {
      lineCount: 1,
      lines: [' '],
    }
    expect(getLines(ctx, text, maxWidth)).toEqual(expectedResult)
  })
})

describe('textWidth function', () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CanvasRenderingContext2D not supported')

  it('should return the width of the text', () => {
    const text = 'Lorem ipsum dolor sit amet'
    const expectedResult = parseInt(ctx.measureText(text).width.toFixed(2))
    expect(textWidth(text, ctx)).toBe(expectedResult)
  })
})

describe('textHeight function', () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CanvasRenderingContext2D not supported')

  it('should return the height of the text', () => {
    const text = 'Lorem ipsum dolor sit amet'
    const metrics = ctx.measureText(text)
    const expectedResult = metrics?.actualBoundingBoxAscent + metrics?.actualBoundingBoxDescent
    expect(textHeight(text, ctx)).toBe(expectedResult)
  })
})

describe('calcWidth function', () => {
  const canvas = document.createElement('canvas') as HTMLCanvasElement
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CanvasRenderingContext2D not supported')
  it('should calculate the width correctly', () => {
    const dummy = {
      root: {
        child1: {},
        child2: {
          child2a: {},
          child2b: {},
        },
        child3: {},
        child4: {},
      },
    }

    const result = calcWidth(dummy, 0, 1, 0, 0, ctx, defaultConfig)

    const expectedResult = { wid: 250, height: 132, maxi: 50, prevH: 0 }
    expect(result).toStrictEqual(expectedResult)
  })

  it('should return 0 for width when given an empty object', () => {
    const obj = {}
    const result = calcWidth(obj, 0, 1, 0, 0, ctx, defaultConfig)

    expect(result.wid).toBe(0)
  })
})
