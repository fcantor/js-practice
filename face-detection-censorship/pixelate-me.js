const SIZE = 10;
const SCALE = 1.35;
// grab classes
const video = document.querySelector('.webcam');
const canvas = document.querySelector('.video');
const faceCanvas = document.querySelector('.face');

// create context
const ctx = canvas.getContext('2d');
const faceCtx = faceCanvas.getContext('2d');

// make new face detector
const faceDetector = new window.FaceDetector({ fastMode: true });

// write a function that will populate the user's video
async function populateVideo() {
    // grab stream from user's webcam
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {width: 1280, height: 720}
    });
    // set video source to the stream
    video.srcObject = stream;
    await video.play();
    // set the canvas size to be the same size as the video
    console.log(video.videoWidth, video.videoHeight);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    faceCanvas.width = video.videoWidth;
    faceCanvas.height = video.videoHeight;
}

// work with the face detection API
async function detect() {
    const faces = await faceDetector.detect(video);
    // ask the browser when the next animation frame is, and tell it to run detect() for us
    faces.forEach(drawFace);
    faces.forEach(censor);
    requestAnimationFrame(detect);
}

// draws a rectangle around the face
function drawFace(face) {
    // get width and height of the face
    const { width, height, top, left }  = face.boundingBox;
    // clear previous rectangles
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // set color and line width of rectangle
    ctx.strokeStyle = '#F3B401';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, width, height);    
}

// pixelate face(s)
function censor({ boundingBox: face }){
    faceCtx.imageSmoothingEnabled = false;
    faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    // draw the small face
    faceCtx.drawImage(
        // 5 source arguments
        video, // where the source comes from
        face.x, // where we start the source pull from
        face.y,
        face.width,
        face.height,
        // 4 draw arguments
        face.x, // where to start drawing the x and y
        face.y,
        SIZE,
        SIZE,
    );
    // draw the small face back on, but scaled up
    const width = face.width * SCALE;
    const height = face.height * SCALE;
    faceCtx.drawImage(
        faceCanvas, // source
        face.x, // where we start the source pull from
        face.y,
        SIZE,
        SIZE,
        // drawing arguments
        face.x - (width - face.width) / 2,
        face.y - (height - face.height) / 2,
        // how wide, how high
        width,
        height,

    );
    // take that face back out and draw it back at normal size
}

populateVideo().then(detect);

/*
bottom: 268.75
height: 202.5
left: 515
right: 717.5
top: 66.25
width: 202.5
x: 515

*/