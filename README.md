# Audio Visualizer

A sleek desktop audio visualizer built with Electron that creates real-time visual representations of your system audio output.

## Features

- Real-time audio visualization- Multiple visualization styles:
  - Bar graph - Waveform
  - Circular pattern- Always-on-top window
- Transparent background
- Resizable window with fixed aspect ratio- System audio capture

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/visualize-electorn.git
```

2. Install dependencies:

```bash
cd visualizer-electorn
npm install
```

3. Start the application:

```bash
npm start
```

## Building

To create a distributable package

```bash
npm run make
```

This will create platform-specific installers in the `out` directory.

## Usage

1. Launch the application2. Grant system audio access permissions when prompted
2. The visualizer will automatically start displaying your system audio4. Use the dropdown menu to switch between different visualization styles
3. Drag the window to reposition it on your screen6. Resize the window while maintaining aspect ratio

## Development

- Built with Electron and Vite
- Uses Web Audio API for audio processing
- Canvas-based visualizations- Configured with electron-forge for building and distribution
