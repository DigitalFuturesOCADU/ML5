/*
ML5 Single-Person Body Point Threshold Detection using MoveNet

This script uses the ML5 library to perform real-time body pose detection for a single person using a webcam.
It tracks when one body point crosses above another point's vertical position, visualizes the threshold line,
and counts the number of threshold crossings.

Key Variables:
- video: Stores the webcam video feed
- bodyPose: ML5 pose detection model
- poses: Array to store detected poses
- thresholdIndex: Index of the point that defines the threshold line
- trackingIndex: Index of the point being tracked for crossing the threshold
- crossCount: Counter for number of times the tracking point crosses above the threshold
- confidenceThreshold: Minimum confidence score for a point to be considered visible

Key Functions:
- preload(): Loads the ML5 body pose model
- gotPoses(): Callback function when poses are detected
- showAllPoints(): Visualizes all detected keypoints
- showPoint(): Highlights a specific keypoint with given color and index
- checkThresholdCross(): Detects when tracking point crosses above threshold
- drawThresholdArea(): Shows the area above the threshold point
- drawThresholdLine(): Draws a dashed line at the threshold height
- getKeypoint(): Helper function to safely get keypoint data

MoveNet Keypoint Indices:
0: nose
1: left_eye
2: right_eye
3: left_ear
4: right_ear
5: left_shoulder
6: right_shoulder
7: left_elbow
8: right_elbow
9: left_wrist
10: right_wrist
11: left_hip
12: right_hip
13: left_knee
14: right_knee
15: left_ankle
16: right_ankle
*/

// Declare variables for video and pose detection
let video;
let bodyPose;
let poses = [];
let confidenceThreshold = 0.2;
let flipVideo = true;
let showVideo = true;

// Define indices for threshold detection
let thresholdIndex = 0;     // default: nose
let trackingIndex = 10;     // default: right wrist

// Variables for tracking threshold crosses
let crossCount = 0;
let lastAboveThreshold = false;

// Preload function to initialize the ML5 body pose model
function preload() {
    bodyPose = ml5.bodyPose("MoveNet", {flipped: flipVideo});
}

// Setup function to initialize canvas and video capture
function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO, {flipped: flipVideo});
    video.size(640, 480);
    video.hide();
    bodyPose.detectStart(video, gotPoses);
}

// Main draw loop
function draw() {
  background(255);
    // Display the video feed
    if(showVideo)
     { 
    image(video, 0, 0, width, height);
     }
    
    // Check for threshold crossing if pose is detected
    if (poses.length > 0) {
        let thresholdPoint = getKeypoint(thresholdIndex, 0);
        let trackingPoint = getKeypoint(trackingIndex, 0);
        
        // Only process if both points are detected with sufficient confidence
        if (thresholdPoint && trackingPoint && 
            thresholdPoint.confidence > confidenceThreshold && 
            trackingPoint.confidence > confidenceThreshold) {
            
            // Visualize the points
            showPoint(thresholdPoint, color(255, 0, 0));   // Red for threshold point
            showPoint(trackingPoint, color(0, 255, 0));    // Green for tracking point
            
            // Draw threshold visualizations
            drawThresholdArea(thresholdPoint);
            drawThresholdLine(thresholdPoint);
            
            // Check for threshold crossing
            checkThresholdCross(thresholdPoint, trackingPoint);
            
            // Display current status
            displayThresholdData(thresholdPoint, trackingPoint);
        }
    }
}

// Draw semi-transparent area above threshold
function drawThresholdArea(thresholdPoint) {
    if (!thresholdPoint) return;
    
    noStroke();
    fill(255, 0, 0, 70); // Red with 70% opacity
    rect(0, 0, width, thresholdPoint.y);
}

// Draw dashed line at threshold height
function drawThresholdLine(thresholdPoint) {
    if (!thresholdPoint) return;
    
    stroke(255, 0, 0);
    strokeWeight(2);
    drawingContext.setLineDash([5, 5]); // Create dashed line
    line(0, thresholdPoint.y, width, thresholdPoint.y);
    drawingContext.setLineDash([]); // Reset to solid line
}

// Check if tracking point crosses above threshold
function checkThresholdCross(thresholdPoint, trackingPoint) {
    if (!thresholdPoint || !trackingPoint) return;
    
    let isAboveThreshold = trackingPoint.y < thresholdPoint.y;
    
    // Count only when state changes from below to above
    if (isAboveThreshold && !lastAboveThreshold) {
        crossCount++;
        console.log("Threshold crossed!");
    }
    
    lastAboveThreshold = isAboveThreshold;
}

// Display threshold crossing data on screen
function displayThresholdData(thresholdPoint, trackingPoint) {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textSize(16);
    text(`Threshold Crosses: ${crossCount}`, 10, 30);
    
    if (thresholdPoint && trackingPoint) {
        text(`Threshold Y: ${thresholdPoint.y.toFixed(2)}`, 10, 50);
        text(`Tracking Y: ${trackingPoint.y.toFixed(2)}`, 10, 70);
        text(`Position: ${trackingPoint.y < thresholdPoint.y ? "ABOVE" : "BELOW"} threshold`, 10, 90);
    }
}

// Callback function for pose detection results
function gotPoses(results) {
    poses = results || [];
}

// Helper function to safely get keypoint data
function getKeypoint(pointIndex, personIndex = 0) {
    if (!poses || poses.length === 0) return null;
    if (!poses[personIndex]) return null;
    
    const keypoints = poses[personIndex].keypoints;
    if (!keypoints) return null;
    
    return keypoints[pointIndex] || null;
}

// Function to display a single keypoint
function showPoint(point, pointColor) {
    if (!isValidPoint(point)) return;

    // Draw point circle
    fill(pointColor);
    noStroke();
    circle(point.x, point.y, 20);
    
    // Draw point index
    if (point.index != null) {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(10);
        text(point.index, point.x, point.y);
    }
    
    // Draw point coordinates
    fill(255, 255, 0);
    textAlign(CENTER, TOP);
    textSize(8);
    let displayText = `(${Math.round(point.x)}, ${Math.round(point.y)})`;
    if (point.name) {
        displayText = `${point.name}\n${displayText}`;
    }
    text(displayText, point.x, point.y + 15);
}

// Helper function to validate point coordinates
function isValidPoint(point) {
    return point && 
           typeof point.x === 'number' && 
           typeof point.y === 'number';
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