/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates hand tracking on live video through ml5.handPose.
 */

let handPose;
let video;
let hands = [];
let maxHands = 4;
let flipVideo = true;
let showVideo = true;

// Preload function to load the ML5 hand pose model
function preload() {
    handPose = ml5.handPose({maxHands: maxHands, flipped: flipVideo});
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO, {flipped: flipVideo});
  video.size(640, 480);
  video.hide();
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
}

function draw() {
  background(255);
    // Display the video feed based on variable
    if(showVideo) { 
        image(video, 0, 0, width, height);
    }

  // Draw all the tracked hand points
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}

function keyPressed() 
{
    // Toggle video with spacebar
    if (key === ' ') {
        showVideo = !showVideo;
    }
    
    // Save canvas as PNG with 's' key
    if (key === 's' || key === 'S') {
        let timestamp = year() + nf(month(), 2) + nf(day(), 2) + '_' + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
        saveCanvas('pose_' + timestamp, 'png');
    }
}