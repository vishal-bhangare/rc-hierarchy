# RC-Hierarchy

React Component Library for visualizing tree like hierarchical data.

## Demo

https://rc-hierarchy-demo.vercel.app/

## Installation

You can install this component via npm:

```bash
npm i rc-hierarchy
```

Or using yarn:

```bash
yarn add rc-hierarchy
```

## Usage

```jsx
import React from 'react'
import { Hierarchy } from 'rc-hierarchy'

function App() {
  const data = {
    root: {
      It: {
        'Software Development': {
          'Frontend Developer': {},
          'Backend Developer': {},
        },
        'Data Science & Analytics': {},
      },
      'Not-it': {
        'Sales & Marketing': {
          'Marketing Manager': {},
        },
        'Finance & Accounting': {},
      },
    },
  }
  const config = {}
  return <Hierarchy data={data} config={config} />
}

export default App
```

## Props

List of props accepted by your component, along with their types and descriptions.

- `data` (`Object`): Data to be drawn
- `config` (`Object`, optional): Modified properties of drawing configuration

### Config Object Properties

| Property       | Default Value | Description                                                              |
| -------------- | ------------- | ------------------------------------------------------------------------ |
| isCompact?     | false         | Indicates whether to draw in compact mode (true) or normal mode (false)  |
| fontSize?      | 16            | The size of the font used for text rendering                             |
| fontFamily?    | 'Arial'       | The font family for text rendering                                       |
| xt?            | 30            | The horizontal spacing from the parent's x position                      |
| yt?            | 30            | The vertical spacing applied for each depth level                        |
| maxWid?        | 100           | The maximum width for text boxes                                         |
| minWid?        | 50            | The minimum width for text boxes                                         |
| strokeColor?   | random        | The color used for strokes (borders)                                     |
| strokeWidth?   | 3             | The width of strokes (borders)                                           |
| boxSpacing?    | 15            | The space between two text boxes                                         |
| boxPadding?    | 4             | The space between the stroke/border and text content inside the text box |
| boxRadius?     | 5             | The roundness of the text boxes                                          |
| canvasPadding? | 20            | The space inside the canvas (padding)                                    |
| colorScheme?   | random        | The color scheme used for rendering                                      |

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork this repository
2. Create a new branch (`git checkout -b feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature`)
6. Create a new Pull Request

## License

This project is licensed under the [MIT License](https://github.com/vishal-bhangare/rc-hierarchy?tab=MIT-1-ov-file#).
