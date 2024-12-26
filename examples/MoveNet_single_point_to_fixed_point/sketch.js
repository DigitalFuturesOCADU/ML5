/*
ML5 Single-Person Body Pose Detection using MoveNet

This script uses the ML5 library to perform real-time body pose detection for a single person using a webcam.
It visualizes the detected keypoints, measures distances and angles between points,
calculates the centroid of all visible points, and draws a bounding box around the detected person.

Key Variables:
- video: Stores the webcam video feed
- bodyPose: ML5 pose detection model
- poses: Array to store detected poses
- boundingBoxes: Array to store bounding box coordinates for each detected pose
- centroid: Object to store the x and y coordinates of the centroid
- confidenceThreshold: Minimum confidence score for a point to be considered visible
- referencePoint: Fixed point for measuring distances and angles to body points

Key Functions:
- preload(): Loads the ML5 body pose model
- gotPoses(): Callback function when poses are detected
- showAllPoints(): Visualizes all detected keypoints and the bounding box
- showPoint(): Highlights a specific keypoint with given color and index
- showCentroid(): Highlights the centroid point
- getKeypoint(): Helper function to safely get keypoint data
- measureDistance(point1, point2): Calculates and shows distance between two points in pixels
- measureAngle(basePoint, endPoint): Calculates and shows angle from horizontal in degrees

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

Example of using getKeypoint() and measurements:
// Get nose position and measure from reference point
let nose = getKeypoint(0, 0);  // (pointIndex, personIndex)
if (nose && nose.confidence > confidenceThreshold) {
    // Calculate distance and angle to reference point
    let distance = measureDistance(referencePoint, nose);  // Returns distance in pixels
    let angle = measureAngle(referencePoint, nose);       // Returns angle in degrees
    
    // Use the measurements
    console.log(`Distance: ${Math.round(distance)}px`);
    console.log(`Angle: ${Math.round(angle)}°`);
}


*/

// Declare variables for video, pose detection, and data storage
let video;
let bodyPose;
let poses = [];
let boundingBoxes = [];
let centroid = { x: 0, y: 0 };
let confidenceThreshold = 0.2;
let flipVideo = true;
let showVideo = true;
let bodyPointIndex = 2;
let fixedPoint = { x: 320, y: 240 }; // Center of 640x480 canvas

// Preload function to load the ML5 body pose model
function preload() {
    bodyPose = ml5.bodyPose("MoveNet", {flipped: flipVideo});
}

// Setup function to initialize the canvas, video, and start pose detection
function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO, {flipped: flipVideo});
    video.size(640, 480);
    video.hide();
    bodyPose.detectStart(video, gotPoses);
}

function draw() {
    background(255);
    // Display the video feed based on variable
    if(showVideo)
     { 
    image(video, 0, 0, width, height);
     }
    
    // Process and display pose data
   // showAllPoints();
   // showCentroid();
    
    // Draw reference point
    let referencePoint = { x: fixedPoint.x, y: fixedPoint.y };
    fill(255, 165, 0);
    circle(referencePoint.x, referencePoint.y, 10);
    

    if (poses.length > 0) {
        let bodyPoint = getKeypoint(bodyPointIndex, 0);
        if (bodyPoint && bodyPoint.confidence > confidenceThreshold) {
            showPoint(bodyPoint, color(0, 255, 0));  
          
            let distance = measureDistance(referencePoint, bodyPoint);
            let angle = measureAngle(referencePoint, bodyPoint);
            
            // Now you can use distance and angle values for other purposes
        }
    }
}

// Callback function when poses are detected
function gotPoses(results) {
    poses = results || [];
    
    // Update bounding boxes and centroid
    boundingBoxes = poses.map(pose => pose.box).filter(box => box != null);
    
    // Update centroid position
    if (boundingBoxes[0]) {
        const box = boundingBoxes[0];
        centroid.x = (box.xMin + box.xMax) / 2;
        centroid.y = (box.yMin + box.yMax) / 2;
    } else {
        centroid.x = 0;
        centroid.y = 0;
    }
}

// Function to visualize all detected keypoints and bounding box
function showAllPoints() {
    // Draw bounding boxes
    boundingBoxes.forEach((box, i) => {
        if (!box) return;

        // Draw box outline
        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rect(box.xMin, box.yMin, box.width, box.height);
        
        // Draw box dimensions
        fill(0, 255, 0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        
        // Width label
        text(`Width: ${Math.round(box.width)}px`, 
             box.xMin + box.width / 2, box.yMin - 10);
        
        // Height label
        push();
        translate(box.xMin - 10, box.yMin + box.height / 2);
        rotate(-PI/2);
        text(`Height: ${Math.round(box.height)}px`, 0, 0);
        pop();

        // Person number label
        text(`Person ${i}`, box.xMin + box.width / 2, box.yMin + 20);
    });

    // Draw all keypoints for each person
    poses.forEach((pose, personIndex) => {
        // Check each possible keypoint (0-16 for MoveNet)
        for (let pointIndex = 0; pointIndex < 17; pointIndex++) {
            const point = getKeypoint(pointIndex, personIndex);
            if (point && point.confidence > confidenceThreshold) {
                point.index = pointIndex;
                showPoint(point, color(0, 255, 0));
            }
        }
    });
}

// Function to highlight a specific point with a given color
function showPoint(point, pointColor) {
    if (!isValidPoint(point)) return;

    // Draw point circle
    fill(pointColor);
    noStroke();
    circle(point.x, point.y, 20);
    
    // Draw point index number
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

// Function to highlight the centroid point
function showCentroid() {
    if (!isValidPoint(centroid)) return;

    // Draw centroid circle
    fill(255, 0, 0);
    noStroke();
    circle(centroid.x, centroid.y, 15);
    
    // Draw 'C' label
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(10);
    text('C', centroid.x, centroid.y);
    
    // Draw centroid coordinates
    fill(255, 255, 0);
    textAlign(CENTER, TOP);
    textSize(8);
    text(`Centroid: (${Math.round(centroid.x)}, ${Math.round(centroid.y)})`, 
         centroid.x, centroid.y + 15);
}


// Helper function to safely get keypoint data
function getKeypoint(pointIndex, personIndex = 0) {
    // Check if we have valid data
    if (!poses || poses.length === 0) return null;
    if (!poses[personIndex]) return null;
    
    // Get the keypoint if it exists
    const keypoints = poses[personIndex].keypoints;
    if (!keypoints) return null;
    
    return keypoints[pointIndex] || null;
}

// Helper function to check if a point has valid coordinates
function isValidPoint(point) {
    return point && 
           typeof point.x === 'number' && 
           typeof point.y === 'number';
}
function measureDistance(point1, point2) {
    if (!point1 || !point2) return null;
    
    // Calculate distance
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Draw line between points
    stroke(255, 165, 0); // Orange
    line(point1.x, point1.y, point2.x, point2.y);
    
    // Show distance text at midpoint
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;
    noStroke();
    fill(255, 165, 0);
    textSize(12);
    text(`${Math.round(distance)}px`, midX, midY);

    return distance;
}

function measureAngle(basePoint, endPoint) {
    if (!basePoint || !endPoint) return null;
    
    // Calculate angle
    const dx = endPoint.x - basePoint.x;
    const dy = endPoint.y - basePoint.y;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    
    // Draw angle arc
    noFill();
    stroke(255, 165, 0);
    const arcRadius = 30;
    arc(basePoint.x, basePoint.y, arcRadius*2, arcRadius*2, 0, angle * PI/180);
    
    // Draw small line at 0 degrees for reference
    stroke(255, 165, 0, 127); // Semi-transparent orange
    line(basePoint.x, basePoint.y, basePoint.x + arcRadius, basePoint.y);
    
    // Show angle text near base point
    noStroke();
    fill(255, 165, 0);
    textSize(12);
    text(`${Math.round(angle)}°`, basePoint.x + arcRadius + 5, basePoint.y);

    return angle;
}
function mouseClicked() {
    fixedPoint.x = mouseX;
    fixedPoint.y = mouseY;
}
function keyPressed() {
  if (key === ' ') {
    showVideo = !showVideo;
  }
  if (keyCode === LEFT_ARROW) {
    bodyPointIndex = (bodyPointIndex - 1 + 17) % 17;  // 17 points total (0-16)
  }
  if (keyCode === RIGHT_ARROW) {
    bodyPointIndex = (bodyPointIndex + 1) % 17;
  }
  // Save canvas as PNG with 's' key
    if (key === 's' || key === 'S') {
        let timestamp = year() + nf(month(), 2) + nf(day(), 2) + '_' + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
        saveCanvas('pose_' + timestamp, 'png');
    }
}