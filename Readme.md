# ML5.js Documentation

## Table of Contents
- [Introduction](#introduction)
- [Coding Considerations](#coding-considerations)
  - [Callbacks](#callbacks)
  - [Error Checking](#error-checking)
  - [Navigating Object Data](#navigating-object-data)
- [Example 1 - bodyPose: Draw all the points](#example-1---bodypose-draw-all-the-points)
- [Example 2 - bodyPose: Fixed point to Body point](#example-2---bodypose-fixed-point-to-body-point)
- [Example 3 - bodyPose: 2 body points](#example-3---bodypose-2-body-points)
- [Example 4 - bodyPose: hand raiser](#example-4---bodypose-hand-raiser)
- [Example 5 - handPose: show everything](#example-5---handpose-show-everything)
- [Example 6 - handPose: compare 2 points](#example-6---handpose-compare-2-points)

## Introduction

These examples show a few ways that you could use web cam input to control data within the p5 canvas using [ml5.js](https://docs.ml5js.org/#/)

ML5 is a javascript framework that simplifies interacting with various machine learning models. There are various models available, but these examples focus on 2 of them: BodyPose & HandPose.

## Coding Considerations

### Callbacks

A Callback function runs on a separate timeline than the draw() loop. It is assigned a specific task and when it completes it:
- executes a specified function
- passes data into that function

In these examples it is used to calculate the points using the video feed and the specified model. For bodyPose it is defined in the setup function:

```javascript
function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO, {flipped: flipVideo});
    video.size(640, 480);
    video.hide();
    bodyPose.detectStart(video, gotPoses);
}
```

This means that each time it calculates a frame (ie gets all the points from a frame of video) it:
- Calls the gotPoses function ***This function can be called anything
- Passes the data about all the points into the function as an object

Find the gotPoses function farther down in the code:

```javascript
// Callback function when poses are detected
function gotPoses(results) {
    // ...
}
```

### Error Checking

Callbacks are really helpful, but can create some challenges:
- We don't know how many points the model will return each time **How many are visible
  - The same point might not exist frame to frame
- These points may not get updated at the same rate as draw

To deal with this, you need to implement simple error checks that ask:
- Does this data actually exist?

Methods:

**if statements**

In many examples you will see this sort of if statement:

```javascript
if (poses.length > 0) {
```

This simply asks: Is there anyone actually visible in the video?

Another common if statement used refers to 'confidence'

When a point is returned from the model it gets a confidence score. *How sure are you that this is really a point?*

This is also often used to filter out bad data:

```javascript
if (bodyPoint.confidence > confidenceThreshold) {
```

**Error Checking Functions**

These examples include a really simple helper function called getKeypoint:

```javascript
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
```

You can see how it is implemented in Example 2:

```javascript
if (poses.length > 0) {
    let bodyPoint = getKeypoint(bodyPointIndex, 0);
    if (bodyPoint && bodyPoint.confidence > confidenceThreshold) {
        showPoint(bodyPoint, color(0, 255, 0)); 
        
        let distance = measureDistance(referencePoint, bodyPoint);
        let angle = measureAngle(referencePoint, bodyPoint);
        
        // Now you can use distance and angle values for other purposes
    }
}
```

*Note - it is possible to achieve some level of error checking by updating/drawing in the callback, but it generally will cause problems down the road.*

### Navigating Object Data

Each frame returns a large amount of data for all points, but it is returned as a single object. To get to the single data point you need, you need to navigate the structure similar to a folder structure:

```javascript
[
  {
    box: { width, height, xMax, xMin, yMax, yMin },
    id: 1,
    keypoints: [{ x, y, confidence, name }, ...],
    left_ankle: { x, y, confidence },
    left_ear: { x, y, confidence },
    left_elbow: { x, y, confidence },
    ...
    confidence: 0.28,
  },
  ...
];
```

You can find all examples [HERE](https://editor.p5js.org/npuckett/collections/quJ3fsQc0)

## Example 1 - bodyPose: Draw all the points

![Example 1 - Draw all points](/images/1_skeleton_drawAllPoints.PNG)

This example looks for all visible points and draws them along with their name/coordinates.

It is useful for planning interactions and understanding how the model works.

Controls:
- Use Spacebar to hide/show video

- [Editor](https://editor.p5js.org/npuckett/sketches/GF3ITZlgZ)
- [Fullscreen](https://editor.p5js.org/npuckett/full/GF3ITZlgZ)

## Example 2 - bodyPose: Fixed point to Body point

![Example 2 - Fixed point to body point](/images/2_fixedPoint_body.PNG)

This example focusses on a single tracked point in relation to a point on screen.

Change these 2 variables to adjust:
```javascript
let bodyPointIndex = 2;
let fixedPoint = { x: 320, y: 240 }; // Center of 640x480 canvas
```

Controls:
- Use Spacebar to hide/show video
- Left/Right arrows to change track point
- Click to change the point on screen

- [Editor](https://editor.p5js.org/npuckett/sketches/YPtq01HYR)
- [Fullscreen](https://editor.p5js.org/npuckett/full/YPtq01HYR)

## Example 3 - bodyPose: 2 body points

![Example 3 - Two body points](/images/3_bodyPt_bodyPt.PNG)

This example draws 2 tracked points and generates the data about the relationship.

It also sets a threshold so that if the points get within the distance it triggers a function called: bodyClick

Important variables:
```javascript
let bodyPoint1Index = 16; // Default to right hand (adjust as needed)
let bodyPoint2Index = 5;  // Default to right eye (adjust as needed)
let threshold = 100;
```

Controls:
- Use Spacebar to hide/show video

- [Editor](https://editor.p5js.org/npuckett/sketches/euYzKBZhs)
- [Fullscreen](https://editor.p5js.org/npuckett/full/euYzKBZhs)

## Example 4 - bodyPose: hand raiser

![Example 4 - Hand raiser](/images/4_handraiser.PNG)

This example creates a relationship between 2 points on the body using a threshold on an axis.

It compares the y pixel value of the nose to the y value of the hand to create a simple gesture input. It also triggers the bodyClick function.

Controls:
- Use Spacebar to hide/show video

- [Editor](https://editor.p5js.org/npuckett/sketches/nPbFb5plQ)
- [Fullscreen](https://editor.p5js.org/npuckett/full/nPbFb5plQ)

## Example 5 - handPose: show everything

![Example 5 - Show all hand points](/images/5_hand_drawAllPoints.PNG)

This simple example shows all possible points tracked on hands

- [Editor](https://editor.p5js.org/ml5/sketches/QGH3dwJ1A)
- [Fullscreen](https://editor.p5js.org/ml5/full/QGH3dwJ1A)

## Example 6 - handPose: compare 2 points

![Example 6 - Compare hand points](/images/6_handPt_handPt.PNG)

Important Variables:
```javascript
let handNumberIndex1 = 0;  // First hand index (0 or 1)
let handPointIndex1 = 4;   // Default to thumb tip
let handNumberIndex2 = 1;  // Second hand index (0 or 1)
let handPointIndex2 = 8;   // Default to index tip
let maxHands = 4;          // maximum number of hands that can be tracked
```

Controls:
- Use Spacebar to hide/show video

- [Editor](https://editor.p5js.org/npuckett/sketches/l-Xunj0fg)
- [Fullscreen](https://editor.p5js.org/npuckett/full/l-Xunj0fg)