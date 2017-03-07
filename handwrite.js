var canvas = document.getElementById("canvas");

//是否是点下状态
var isDown = false;
//上一次的位置
var lastLoc = {
    x: 0,
    y: 0
};
//开始的时间
var lastTimestamp = 0;
//上一次的线条宽度
var lastLineWidth = -1;

var strokeColor = "red";
var canvasWidth = Math.min(500, $(window).width() - 20);
var canvasHeight = canvasWidth;
$("#controller").css("width", canvasWidth + "px");

canvas.width = canvasWidth;
canvas.height = canvasHeight;
var ctx = canvas.getContext("2d");
drawGrid();

function drawGrid() {
    ctx.save();

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "red";
    ctx.moveTo(2, 2);
    ctx.lineTo(canvasWidth - 2, 2);
    ctx.lineTo(canvasWidth - 2, canvasWidth - 2);
    ctx.lineTo(2, canvasWidth - 2);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 2;
    drawDashline(ctx, 0, 0, canvasWidth, canvasHeight);
    drawDashline(ctx, 0, canvasHeight, canvasWidth, 0);
    drawDashline(ctx, 0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
    drawDashline(ctx, canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
    ctx.closePath();
}

//得到斜线长度
function getBeveling(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}
//画虚线
function drawDashline(context, x1, y1, x2, y2, dashlen) {
    dashlen = dashlen === undefined ? 5 : dashlen;
    //虚线总长度
    var beveling = getBeveling(x2 - x1, y2 - y1);
    //计算多少个线段
    var num = Math.floor(beveling / dashlen);


    for (var i = 0; i < num; i++) {
        context[i % 2 == 0 ? 'moveTo' : 'lineTo'](x1 + (x2 - x1) / num * i, y1 + (y2 - y1) / num * i);
    }
    context.stroke();
}

function windowTocanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return {
        x: Math.round(x - bbox.left),
        y: Math.round(y - bbox.top)
    }
}
//计算距离
function calcDistance(loc1, loc2) {
    return Math.sqrt(Math.pow((loc1.x - loc2.x), 2) - Math.pow((loc1.y - loc2.y), 2))
}
//计算粗细（取决于速度）
var maxLineWidth = 20;
var minLineWidth = 2;
var maxV = 10;
var minV = 0.5;

function calcLineWidth(t, s) {
    v = s / t;
    var resultLineWidth;
    if (v <= minV) {
        resultLineWidth = maxLineWidth;
    } else if (v >= maxV) {
        resultLineWidth = minLineWidth;
    } else {
        resultLineWidth = maxLineWidth - (v - minV) / (maxV - minV) * (maxLineWidth - minLineWidth)
    }
    if (lastLineWidth = -minLineWidth)
        return resultLineWidth;
    else
        return lastLineWidth * 3 / 5 + resultLineWidth * 2 / 5
}

function beginStroke(point) {
    isDown = true;
    lastLoc = windowTocanvas(point.x, point.y);
    // alert(lastLoc.x);
    lastTimestamp = new Date().getTime();
}

function endStroke() {
    isDown = false;
}

function moveStroke(point) {
    var curLoc = windowTocanvas(point.x, point.y);
    var curTimestamp = new Date().getTime();
    var s = calcDistance(curLoc, lastLoc)
    var t = curTimestamp - lastTimestamp;
    var lineWidth = calcLineWidth(t, s);
    //draw
    ctx.beginPath();
    ctx.moveTo(lastLoc.x, lastLoc.y);
    ctx.lineTo(curLoc.x, curLoc.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    //边缘变得圆滑
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.closePath()
    ctx.stroke();

    lastLoc = curLoc;
    lastTimestamp = curTimestamp;
    lastLineWidth = lineWidth;

}
//鼠标事件
canvas.onmousedown = function (e) {
    e.preventDefault();
    beginStroke({
        x: e.clientX,
        y: e.clientY
    });

}
canvas.onmouseup = function (e) {
    e.preventDefault();
    endStroke();

}
canvas.onmouseout = function (e) {
    e.preventDefault();
    endStroke();
}
canvas.onmousemove = function (e) {
    e.preventDefault();
    if (isDown) {
        moveStroke({
            x: e.clientX,
            y: e.clientY
        });

    }
}
//触摸事件
canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    touch = e.touches[0];
    beginStroke({
        x: touch.pageX,
        y: touch.pageY
    });

})
canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    touch = e.touches[0];
    moveStroke({
        x: touch.pageX,
        y: touch.pageY
    });

})
canvas.addEventListener("touchend", function (e) {
    e.preventDefault();
    endStroke();

})

//控制
var clear = document.getElementsByClassName("btn-clear")[0];



clear.onclick = function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawGrid();
}
$(".btn-color").click(function () {
    strokeColor = $(this).css("background-color");

    $(".btn-color").removeClass("btn-selected");
    $(this).addClass("btn-selected");
})