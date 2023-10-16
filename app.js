const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let video;

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ 'video': true });
    video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function detectFrame(model) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const predictions = await model.detect(video);
    renderPredictions(predictions);

    requestAnimationFrame(() => {
        detectFrame(model);
    });
}

function renderPredictions(predictions) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 4;
        ctx.strokeRect(...prediction.bbox);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#00FF00';
        ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
    });
}

async function bindPage() {
    const model = await cocoSsd.load();
    detectFrame(model);
}

window.onload = async () => {
    await setupCamera();
    bindPage();
};
