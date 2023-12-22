const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let isDragging = false;

let shapes = ["square", "circle", "triangle"];

var movingShape;
var movingShapeProperties = {};

let movingShapeProperties_init = {
    square: { x: 260, y: 50, width: 80, height: 80 },
    circle: { x: 300, y: 90, radius: 40 },
    triangle: { x: 250, y: 130, width: 100, height: 80 },
};
let backupMovingShapeProperties = JSON.parse(JSON.stringify(movingShapeProperties_init));

let shapeColors = ["lightblue", "pink", "lightgreen"];
var shape_center = { x: 300, y: 90 };

let shapeColorId = Math.floor(Math.random() * shapeColors.length);

var holes = [
    { x: 75, y: 200, width: 100, height: 100, shape: "square", colorId: 0},
    { x: 300, y: 250, radius: 50, shape: "circle", colorId: 0},
    { x: 425, y: 300, width: 120, height: 100, shape: "triangle", colorId: 0},
];

let holes_center = [
    { x: 125, y: 250, shape: "square" },
    { x: 300, y: 250, shape: "circle" },
    { x: 475, y: 250, shape: "triangle" },
];

function draw_holes() {
    holes.forEach((hole) => {
        ctx.fillStyle = shapeColors[hole.colorId];

        if (hole.shape === "square") {
            ctx.fillRect(hole.x, hole.y, hole.width, hole.height);
        } else if (hole.shape === "circle") {
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (hole.shape === "triangle") {
            ctx.beginPath();
            ctx.moveTo(hole.x, hole.y);
            ctx.lineTo(hole.x + hole.width / 2, hole.y - hole.height);
            ctx.lineTo(hole.x + hole.width, hole.y);
            ctx.closePath();
            ctx.fill();
        }
    });
}

function new_shape() {
    shape_center.x = 300;
    shape_center.y = 90;
    
    holes.forEach((hole) => {
        hole.colorId = Math.floor(Math.random() * shapeColors.length);
    });
    
    movingShape = shapes[Math.floor(Math.random() * shapes.length)];
    movingShapeProperties = JSON.parse(JSON.stringify(backupMovingShapeProperties));
}

function updateScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_holes();
    draw_shape();
}

function draw_shape() {
    ctx.fillStyle = shapeColors[shapeColorId];
    const shapeProperties = movingShapeProperties[movingShape];

    if (movingShape === "square") {
        ctx.fillRect(shapeProperties.x, shapeProperties.y, shapeProperties.width, shapeProperties.height);
    } else if (movingShape === "circle") {
        ctx.beginPath();
        ctx.arc(shapeProperties.x, shapeProperties.y, shapeProperties.radius, 0, Math.PI * 2);
        ctx.fill();
    } else if (movingShape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(shapeProperties.x, shapeProperties.y);
        ctx.lineTo(shapeProperties.x + shapeProperties.width / 2, shapeProperties.y - shapeProperties.height);
        ctx.lineTo(shapeProperties.x + shapeProperties.width, shapeProperties.y);
        ctx.closePath();
        ctx.fill();
    }
}

let initialClickX, initialClickY;
let initialShapeX, initialShapeY;
let initialCenterX, initialCenterY;

function showCursorPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDragging) {
        if (!initialClickX && !initialClickY) {
            initialClickX = x;
            initialClickY = y;

            initialShapeX = movingShapeProperties[movingShape].x;
            initialShapeY = movingShapeProperties[movingShape].y;

            initialCenterX = shape_center.x;
            initialCenterY = shape_center.y;
        }

        const offsetX = x - initialClickX;
        const offsetY = y - initialClickY;

        shape_center.x = initialCenterX + offsetX;
        shape_center.y = initialCenterY + offsetY;

        movingShapeProperties[movingShape].x = initialShapeX + offsetX;
        movingShapeProperties[movingShape].y = initialShapeY + offsetY;
        
        checkCollision()
        updateScreen();
    } else {
        initialClickX = null;
        initialClickY = null;
    }
}

canvas.addEventListener("mousedown", function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= shape_center.x - 40 && x <= shape_center.x + 40 && y >= shape_center.y - 40 && y <= shape_center.y + 40) {
        isDragging = true;
    }
});

canvas.addEventListener("mouseup", function () {
    isDragging = false;
});

canvas.addEventListener("mousemove", function (event) {
    showCursorPosition(event);
});

canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= shape_center.x - 40 && x <= shape_center.x + 40 && y >= shape_center.y - 40 && y <= shape_center.y + 40) {
        nextColor();
        updateScreen();
        
        // var text = '';
        
        // console.log(shapeColorId);
        
        // holes.forEach((hole) => {
        //     text += hole.colorId;
        // });
        // console.log(text);
    }
});

// && 
function checkCollision() {
    holes.forEach((hole) => {
        if (hole.colorId === shapeColorId){
            holes_center.forEach((hole) => {
            if ((hole.shape === movingShape) ) {
                const distX = Math.abs(shape_center.x - hole.x);
                const distY = Math.abs(shape_center.y - hole.y);
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                if (dist < 10) {
                    movingShapeProperties = movingShapeProperties_init;
                    
                    score_temp++;
                    
                    if (score_temp >= 5) {
                        userScore++;
                        setCookie('score', userScore, 30);
                        const scoreDiv = document.getElementById('total_score');
                        scoreDiv.textContent = '✨' + userScore;
                        playrewordSound();
                        score_temp = 0;
                    }
                    
                    updateScore();
                    new_shape();
                    updateScreen();
                    playScoreSound();
                    
                    isDragging = false;
                }   
            }
        });
        }
    });  
}

function playScoreSound() {
    const scoreSound = new Audio('sfx.mp3');
    scoreSound.play();
}

function playrewordSound() {
    const scoreSound = new Audio('sfx2.mp3');
    scoreSound.play();
}

function updateScore() {
    const scoreDiv = document.getElementById('score');
    scoreDiv.innerHTML = '';
    for (let i = 0; i <= score_temp; i++) {
        scoreDiv.innerHTML += '🌟';
    }
}

function nextColor() {
    shapeColorId = (shapeColorId + 1) % shapeColors.length;
}

const fingerImage = new Image();
fingerImage.src = 'finger.png';

function drawFinger(x, y) {
    ctx.drawImage(fingerImage, x - 25, y - 25, 50, 50);
}

function animateFinger() {
    let currentIndex = 0;
    const intervalDuration = 100;

    const interval = setInterval(() => {
        const startX = shape_center.x;
        const startY = shape_center.y;
        const endX = holes_center[currentIndex].x;
        const endY = holes_center[currentIndex].y;

        if (holes_center[currentIndex].shape === movingShape) {
            moveFinger(startX, startY, endX, endY);
        }

        currentIndex++;

        if (currentIndex >= holes_center.length) {
            clearInterval(interval);
        }
    }, intervalDuration);
}

function moveFinger(startX, startY, endX, endY) {
    let currentPosition = { x: startX, y: startY };
    let step = 0.1;
    let t = step;

    const interval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw_shape();
        draw_holes();

        const x = (1 - t) * startX + t * endX;
        const y = (1 - t) * startY + t * endY;

        drawFinger(x, y);

        t += step;

        if (t > 1) {
            clearInterval(interval);
            updateScreen();
        }
    }, 100);
}

const helpButton = document.getElementById("helpButton");

helpButton.addEventListener("click", function () {
    animateFinger();
});


function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

var score_temp = 0;

let userScore = getCookie('score');
console.log('User score:', userScore);

new_shape();
updateScreen();
