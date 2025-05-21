/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";

let audioContext;
let analyser;
let source;
let animationId;
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
// const startButton = document.getElementById("startAudio");
const visualizationType = document.getElementById("visualizationType");

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Initialize audio context and analyzer
async function initAudio() {
  try {
    console.log("Renderer: Starting audio initialization...");

    if (!window.systemAudio?.getSource) {
      throw new Error("System Audio API not available");
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();

    console.log("Renderer: Getting system audio source...");
    // const screenSource = await window.systemAudio.getSource();
    // console.log("Renderer: Selected source:", screenSource);

    // if (!screenSource) {
    //   throw new Error("No audio source found");
    // }

    const constraints = {
      audio: {
        mandatory: {
          chromeMediaSource: "desktop",
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          // chromeMediaSourceId: screenSource.id,
        },
      },
    };

    console.log("Renderer: Getting user media with constraints:", constraints);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Extract audio track only
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
      throw new Error("No audio track found in the stream");
    }

    console.log("Renderer: Creating audio stream...");
    const audioStream = new MediaStream([audioTrack]);
    source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    analyser.fftSize = 1024; // 2048;
    startVisualizer();
    // startButton.textContent = "Stop";

    // Stop video track since we only need audio
    stream.getVideoTracks().forEach((track) => track.stop());

    console.log("Renderer: Audio initialization complete");
  } catch (err) {
    console.error("Renderer: Error accessing system audio:", err);
    console.log("Renderer: Error details:", err.message);
    alert(`Error accessing system audio: ${err.message}`);
  }
}

// Visualization functions
function drawBars(dataArray) {
  const bufferLength = analyser.frequencyBinCount;
  const barWidth = canvas.width / (bufferLength / 2); // * 3.3; //1.5
  let x = 0;
  ctx.imageSmoothingEnabled = false;

  for (let i = 0; i < bufferLength; i++) {
    // Scale the bar height based on the audio amplitude
    // The amplitude is normalized to be between 0 and 255
    // We multiply it by the height of the canvas and divide by 255 to get the bar height
    // The bar height is then scaled further by 0.5 to make it smaller and easier to see
    const barHeight = (dataArray[i] * canvas.height) / 255; //* 0.5;

    // const hue = (i / bufferLength) * 360;

    // ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    // ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

    const hue = (i / bufferLength) * 300;
    const saturation = 80 + (dataArray[i] / 255) * 20;
    const lightness = 50; // 40 + (dataArray[i] / 255) * 20;

    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    // ctx.fillStyle = "rgba(255, 255, 255, 0.4)";

    const centerY = canvas.height / 2;
    ctx.fillRect(x, centerY, barWidth, barHeight / 2);
    ctx.fillRect(x, centerY, barWidth, -barHeight / 2);

    x += barWidth; // - 1;
  }
}
// function drawBars(ctx, bufferLength, x, barWidth, barHeight, i) {
//   const hue = (i / bufferLength) * 300;
//   const saturation = 80 + (dataArray[i] / 255) * 20;
//   const lightness = 40 + (dataArray[i] / 255) * 20;
//   ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

//   const centerY = canvas.height / 2;
//   ctx.fillRect(x, centerY, barWidth, barHeight / 2);
//   ctx.fillRect(x, centerY, barWidth, -barHeight / 2);
// }

function drawWave(dataArray) {
  const bufferLength = analyser.frequencyBinCount;
  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.strokeStyle = `hsl(${Date.now() % 360}, 100%, 50%)`;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCircle(dataArray) {
  const bufferLength = analyser.frequencyBinCount;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 4;

  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const angle = (i * 2 * Math.PI) / bufferLength;
    const amplitude = dataArray[i] * 1.5;
    const x = centerX + (radius + amplitude) * Math.cos(angle);
    const y = centerY + (radius + amplitude) * Math.sin(angle);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.strokeStyle = `hsl(${Date.now() % 360}, 100%, 50%)`;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function draw() {
  animationId = requestAnimationFrame(draw);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  switch (visualizationType.value) {
    case "bars":
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBars(dataArray);
      break;
    case "wave":
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWave(dataArray);
      break;
    case "circle":
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCircle(dataArray);
      break;
  }
}

function startVisualizer() {
  if (!animationId) {
    draw();
  }
}

function stopVisualizer() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (source) {
    source.disconnect();
    source = null;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // startButton.textContent = "Start";
}

// Event listeners
// startButton.addEventListener("click", () => {
//   if (!audioContext) {
//     initAudio();
//   } else {
//     stopVisualizer();
//   }
// });
if (!audioContext) {
  initAudio();
}

visualizationType.addEventListener("change", () => {
  if (audioContext) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});
