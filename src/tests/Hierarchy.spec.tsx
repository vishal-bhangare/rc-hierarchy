import React from 'react'
import { render } from '@testing-library/react'
import { Hierarchy } from '../components'

describe('Hierarchy component', () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CanvasRenderingContext2D not supported')
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
  beforeEach(() => {
    // Mock document.getElementById to return a canvas element
    jest.spyOn(document, 'getElementById').mockReturnValueOnce({
      getContext: () => ctx,
    } as any)
  })

  it('Draw data in Normal Mode', () => {
    render(<Hierarchy data={dummy} />)
    expect(true).toBeTruthy()
  })
  it('Draw data in Compact Mode', () => {
    render(
      <Hierarchy
        data={dummy}
        config={{
          isCompact: true,
          ct: 1,
        }}
      />,
    )
    expect(true).toBeTruthy()
  })
})
