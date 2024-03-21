const canvas = document.querySelector("canvas");
const toolBtns = document.querySelectorAll(".tool");
ctx = canvas.getContext("2d");
fillcolor = document.querySelector("#fill-color");
sizeSlider = document.querySelector("#size-slider");
colorBtns = document.querySelectorAll(".colors .option");
colorPicker = document.querySelector("#color-picker");
clearCanvas = document.querySelector(".clear-canvas");
saveImg = document.querySelector(".save-img");

// size of canvas


// undo and redo button
undoBtn = document.querySelector(".undo");
redoBtn = document.querySelector(".redo");

// undo and redo variables
let undoStack = [];
let redoStack = [];

function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack = []; // Clear redo stack
    updateButtons();
}



let isDrawing = false;
let selectedTool = "brush";
let brushWidth = 3;
let prevMouseX;
let prevMouseY;
let snapshot;
selectedColor = "#000";

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

// chat gpt generated
// document.getElementById('rectangle').addEventListener('click', () => {
//     selectedTool = 'rectangle';
//     document.querySelector(".options .active").classList.remove("active");
//     document.getElementById('rectangle').classList.add("active");
// });

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
})

const drawRect = (e) => {
    if(!fillcolor.checked){
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }

    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawCircle = (e) =>{
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX),2) + Math.pow((prevMouseY - e.offsetY),2));
    ctx.arc(prevMouseX, prevMouseY,radius, 50, 0, 2*Math.PI);
    //ctx.stroke();
    fillcolor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = (e) =>{
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX*2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillcolor.checked ? ctx.fill() : ctx.stroke();
}

const startDrawing = (e) =>{
    isDrawing = true;
    
    
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;

    ctx.beginPath();
    ctx.lineWidth = brushWidth;

    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;

    snapshot = ctx.getImageData(0,0,canvas.width, canvas.height);


}

const stopDrawing = () =>{
    isDrawing = false;

    saveState();

}

const drawing = (e) => {
    if(!isDrawing){
        return;
    }

    ctx.putImageData(snapshot,0,0);

    if(selectedTool === "brush" || selectedTool === "eraser"){
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }else if (selectedTool === "rectangle"){
        drawRect(e);
    }else if (selectedTool === "circle"){
        drawCircle(e);
    }else if (selectedTool === "triangle"){
        drawTriangle(e);
    }
    
}

toolBtns.forEach(btn => {
    btn.addEventListener("click" , () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(selectedTool);
    })
})

sizeSlider.addEventListener("change", () => {
    brushWidth = sizeSlider.value;
})

colorBtns.forEach(btn => {
    btn.addEventListener("click",() => {
        
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = (window.getComputedStyle(btn).getPropertyValue("background-color"));
    })
})

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
})

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    setCanvasBackground();
})

saveImg.addEventListener("click", () => {
    
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    alert("Image will be downloaded as: " + `${Date.now()}.jpg`);
    link.href = canvas.toDataURL();
    link.click();
})

// undo and redo logic

undoBtn.addEventListener("click", () => {
    if (undoStack.length <= 1) return; // Nothing to undo
    redoStack.push(undoStack.pop());
    const img = new Image();
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = undoStack[undoStack.length - 1];
    updateButtons();
})

redoBtn.addEventListener("click", () => {
    if (redoStack.length === 0) return; // Nothing to redo
        undoStack.push(redoStack.pop());
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = undoStack[undoStack.length - 1];
        updateButtons();
})

function updateButtons() {
    document.getElementById('undoBtn').disabled = undoStack.length === 0;
    document.getElementById('redoBtn').disabled = redoStack.length === 0;
}

canvas.addEventListener("mousedown", startDrawing)
canvas.addEventListener("mousemove", drawing)
canvas.addEventListener("mouseup", stopDrawing)