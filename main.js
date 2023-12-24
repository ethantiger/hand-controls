import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import {Camera} from './src/camera'

const model = handPoseDetection.SupportedModels.MediaPipeHands;
const detectorConfig = {
  runtime: 'mediapipe', // or 'tfjs',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  modelType: 'full'
}
const detector = await handPoseDetection.createDetector(model, detectorConfig);


const camera = new Camera()
camera.setupCamera(1080,720)

onFrame()


async function onFrame() {
  camera.ctx.drawImage(camera.video, 0, 0, camera.canvas.width, camera.canvas.height);

   // Get image data from canvas
   const imageData = camera.ctx.getImageData(0, 0, camera.canvas.width, camera.canvas.height);

   // Send image data to handpose model
   const hands = await detector.estimateHands(imageData,{flipHorizontal: true});

   for (let i =0; i < hands.length; i++) {
    if (hands[i].keypoints != null) {
      camera.drawKeypoints(hands[i].keypoints, hands[i].handedness)
    }
   }
   
  requestAnimationFrame(onFrame);
}
