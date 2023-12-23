import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';


const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
}; // for rendering each finger as a polyline


const model = handPoseDetection.SupportedModels.MediaPipeHands;
const detectorConfig = {
  runtime: 'mediapipe', // or 'tfjs',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  modelType: 'full'
}
const detector = await handPoseDetection.createDetector(model, detectorConfig);

const video = document.getElementById('video')
video.style.transform = "scaleX(-1)";
video.width = 360;
video.height = 270;


async function startvideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

function drawKeypoints(ctx, keypoints, handedness) {
  const keypointsArray = keypoints;
  ctx.fillStyle = handedness === 'Left' ? 'Red' : 'Blue';
  ctx.strokeStyle = 'White';
  ctx.lineWidth = 2;

  for (let i = 0; i < keypointsArray.length; i++) {
    const y = keypointsArray[i].x;
    const x = keypointsArray[i].y;
    drawPoint(ctx, x - 2, y - 2, 3);
  }

  const fingers = Object.keys(fingerLookupIndices);
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
    drawPath(ctx, points, false);
  }
}

function drawPath(ctx, points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point.x, point.y);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

function drawPoint(ctx,y, x, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

async function onFrame() {
  // Draw the video frame to a canvas
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  canvas.width = 720;
  canvas.height = 540;
  const canvasContainer = document.querySelector('.canvas-wrapper');
  canvasContainer.style = `width: ${720}px; height: ${540}px`;

  // Because the image from camera is mirrored, need to flip horizontally.
  ctx.translate(720, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

   // Get image data from canvas
   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

   // Send image data to handpose model
   const hands = await detector.estimateHands(imageData,{flipHorizontal: true});

   for (let i =0; i < hands.length; i++) {
    if (hands[i].keypoints != null) {
      drawKeypoints(ctx, hands[i].keypoints, hands[i].handedness)
    }
   }
   
  requestAnimationFrame(onFrame);
}

startvideo().then(() => {
  onFrame()
})