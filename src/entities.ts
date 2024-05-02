export interface DrawingConfig {
  isCompact: boolean // Indicates whether to draw in compact mode (true) or normal mode (false)
  fontSize: number // The size of the font used for text rendering
  fontFamily: string // The font family for text rendering
  xt: number // The horizontal spacing from the parent's x position
  yt: number // The vertical spacing applied for each depth level
  ct: number // The threshold depth for drawing nodes in compact mode (default is 3; does not support depths greater than 3)
  maxWid: number // The maximum width for text boxes
  minWid: number // The minimum width for text boxes
  strokeWidth: number // The width of strokes (borders)
  boxSpacing: number // The space between two text boxes
  boxPadding: number // The space between the stroke/border and text content inside the text box
  boxRadius: number // The roundness of the text boxes
  canvasPadding: number // The space inside the canvas (padding),
  colorScheme: ColorScheme
  canvasBackgroundColor: string // The canvas background color
}

export interface DrawingConfigPropI {
  isCompact?: boolean // Indicates whether to draw in compact mode (true) or normal mode (false)
  fontSize?: number // The size of the font used for text rendering
  fontFamily?: string // The font family for text rendering
  xt?: number // The horizontal spacing from the parent's x position
  yt?: number // The vertical spacing applied for each depth level
  ct?: number // The depth threshold for drawing nodes in compact form
  maxWid?: number // The maximum width for text boxes
  minWid?: number // The minimum width for text boxes
  strokeColor?: string // The color used for strokes (borders)
  strokeWidth?: number // The width of strokes (borders)
  boxSpacing?: number // The space between two text boxes
  boxPadding?: number // The space between the stroke/border and text content inside the text box
  boxRadius?: number // The roundness of the text boxes
  canvasPadding?: number // The space inside the canvas (padding);
  colorScheme?: ColorScheme
  canvasBackgroundColor?: string // The canvas background color
}

export interface Coordinates {
  x: number // X-coordinate
  y: number // Y-coordinate
}

export interface ColorScheme {
  strokeColor?: string // Color of the border/stroke of a textbox
  backgroundColor?: string // Background color of a textbox
  lineColor?: string // Color of lines connecting parent to child
  textColor?: string // Color of text
}
