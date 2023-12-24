const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
}; // for rendering each finger as a polyline

export class Camera {
  constructor(videoId = 'video', canvasId = 'output') {
    this.video = document.getElementById(videoId)
    this.canvas = document.getElementById(canvasId)
    this.canvasContainer = document.querySelector('.canvas-wrapper')
    this.ctx = this.canvas.getContext('2d')
  }

  async setupCamera(videoWidth, videoHeight) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
          'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const stream = await navigator.mediaDevices.getUserMedia({video: true})
    this.video.srcObject = stream
    
    this.canvas.width = videoWidth
    this.canvas.height = videoHeight
    this.canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`

    this.ctx.translate(videoWidth, 0);
    this.ctx.scale(-1, 1);
  }

  drawPath(points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      region.lineTo(point.x, point.y);
    }
  
    if (closePath) {
      region.closePath();
    }
    this.ctx.stroke(region);
  }
  
  drawPoint(y, x, r) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fill();
  }
  drawKeypoints(keypoints, handedness) {
    const keypointsArray = keypoints;
    this.ctx.fillStyle = handedness === 'Left' ? 'Red' : 'Blue';
    this.ctx.strokeStyle = 'White';
    this.ctx.lineWidth = 2;
  
    for (let i = 0; i < keypointsArray.length; i++) {
      const y = keypointsArray[i].x;
      const x = keypointsArray[i].y;
      this.drawPoint(x - 2, y - 2, 3);
    }
  
    const fingers = Object.keys(fingerLookupIndices);
    for (let i = 0; i < fingers.length; i++) {
      const finger = fingers[i];
      const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
      this.drawPath(points, false);
    }
  }
}