// 전체적인 높이와 너비
let H = 34, W = 20;
// 모든 모양을 블럭을 어레이에 담는다.
let shapeArray = [
    [[2, 2], [1, 2], [1, 1], [0, 1]],
    [[1, 1], [1, 0], [0, 2], [0, 1]],
    [[2, 1], [1, 1], [1, 2], [0, 2]],
    [[1, 2], [1, 1], [0, 1], [0, 0]],
    [[1, 2], [1, 1], [0, 2], [0, 1]],
    [[2, 0], [1, 1], [1, 0], [0, 0]],
    [[1, 1], [0, 2], [0, 1], [0, 0]],
    [[2, 2], [1, 2], [1, 1], [0, 2]],
    [[1, 2], [1, 1], [1, 0], [0, 1]],
    [[3, 1], [2, 1], [1, 1], [0, 1]],
    [[1, 3], [1, 2], [1, 1], [1, 0]],
    [[2, 2], [2, 1], [1, 1], [0, 1]],
    [[1, 0], [0, 2], [0, 1], [0, 0]],
    [[2, 2], [1, 2], [0, 2], [0, 1]],
    [[1, 2], [1, 1], [1, 0], [0, 2]],
    [[2, 2], [2, 1], [1, 2], [0, 2]],
    [[2, 2], [2, 1], [2, 0], [1, 0]],
    [[2, 1], [1, 1], [0, 1], [0, 2]],
    [[1, 2], [0, 2], [0, 1], [0, 0]]
];
let shapeRotateMap = [
    1, 0,
    3, 2,
    4,
    6, 7, 8, 5,
    10, 9,
    12, 13, 14, 11,
    16, 17, 18, 15];
let shapeColorArray = [
    "rgb(199,82,82)",
    "rgb(233,174,43)",
    "rgb(105,155,55)",
    "rgb(53,135,145)",
    "rgb(49,95,151)",
    "rgb(102,86,167)"
];
let wallColor = "gray",
    shapeColor
let nextColorIndex, shapeColorIndex;
let movingSpeed, movingThread;
let fastMode = false;
let initSpeed = 500,
    deltaSpeed = 40,
    fastSpeed = 30;
let shapeCell;
let existField;
let shapePoint;
let createPoint = [1, parseInt(W / 2) - 2]
let nextShape, currentShape;
let score, level, levelStack = 0;
let isPaused = false;


init();

function getElId(y, x) {
    let ret = document.getElementById(String(y) + " " + String(x));
    return ret
}
// 키를 누를 때를 위한 switch
document.onkeydown = keyDownEventHandler;
function keyDownEventHandler(e) {
    switch (e.keyCode) {
        case 37: setTimeout("moveLR(-1)", 0); break; // arrow left
        case 39: setTimeout("moveLR(1)", 0); break; //arrow right
        case 32: setTimeout("rotateShape()", 0); break; // space
        case 40: moveFast(); break; // arrow down
        case 27: pause(); break; // esc
    }
}
// 아래 키를 누르고 떼면 슬로우모드로 돌아감
document.onkeyup = keyUpEventHandler;
function keyUpEventHandler(e) {
    if (e.keyCode == 40) moveSlow();
}
// 초기화 함수
// 필드를 그리고 레벨을 설정하는 듯
// 게임을 초기화 한다.
function init() {
    drawField();
    initExistField();
    setWall();
    nextColorIndex = -1;
    movingSpeed = initSpeed;
    shapeCell = [];
    shapePoint = [1, 1];
    score = 0; level = 1;
    chooseNextShape();
    chooseNextColor();
    createShape();
}


// 필드값을 모두 false로 초기화
function initExistField() {
    existField = new Array(H);
    for (let i = 0; i < H; i++)
        existField[i] = new Array(W);
    for (let i = 0; i < H; i++)
        for (let j = 0; j < W; j++)
            existField[i][j] = false;
}
// 각 줄 gametable이라는 id값과 열에 줄열 값을 id로 준다.
// css 를 먹이이기도 용이하고 id 값을 가져와 js 객체를 핸들링하기도 좋음
function drawField() {
    let fieldTag = "<table id=\"gameTable\" border=0>";
    for (let i = 0; i < H; i++) {
        fieldTag += "<tr>";
        for (let j = 0; j < W; j++)
            fieldTag += "<td id=\"" + String(i) + " " + String(j) + "\"></td>";
        fieldTag += "</tr>"
    }
    document.write(fieldTag);
}
// 회색 배경 벽을 세움
function setWall() {
    for (let i = 0; i < H; i++) {
        getElId(i, 0).style.background = wallColor;
        getElId(i, W - 1).style.background = wallColor;
        existField[i][0] = true;
        existField[i][W - 1] = true;
    }
    for (let i = 0; i < W; i++) {
        getElId(0, i).style.background = wallColor;
        getElId(H - 1, i).style.background = wallColor;
        existField[0][i] = true;
        existField[H - 1][i] = true;
    }
    console.log(existField)
}
// math.random으로 0이상 1미만의 랜덤 난수를 생성한다.
// 그 랜덤값과 length를 곱하면 최댓값은 15가 되므로 0~ 15까지 조회가능
function chooseNextShape() {
    nextShape = parseInt(Math.random() * shapeArray.length)
}
// ++변수를 선언하면 변수에도 1을 더하고 ++변수에도 1을 더한다.
// 그래서 다음과 같이 ++변수 자체를 비교값으로 넣을 수 있음
// 초기화를 위해 함수가 불리면 nextColorIndex값은 바로 0이 된다.
function chooseNextColor() {
    if (++nextColorIndex == shapeColorArray.length)
        nextColorIndex = 0;
}
// 블럭의 움직임이 벗어나지 않는지 검사
function isValidPoint(y, x) {
    return !(y <= 0 || y >= H - 1 || x <= 0 || x >= W - 1 || existField[y][x]);
}
// 레벨 스택을 확인하고 레벨과 그에 따른 속도를 조정하는 함수
function leveling() {
    if (level == 10) return;
    if (levelStack == level * 10) {
        level++;
        levelStack = 0;
        if (!fastMode)
            movingSpeed = initSpeed - (level * deltaSpeed);
    }
    document.getElementById("level").innerHTML = level;
}


// 현재 블락을 생성하고 좌표값을 받아서 저장하는 함수
function createShape() {
    // 화면 중앙에 블럭의 위치를 잡는다. 
    shapePoint[0] = createPoint[0];
    shapePoint[1] = createPoint[1];
    //next블럭을 현재 블럭으로 옮기고
    currentShape = nextShape;
    currentColorIndex = nextColorIndex
    shapeColor = shapeColorArray[currentColorIndex];
    let shape = shapeArray[currentShape];
    // 다음 블럭을 지정하는 함수를 호출
    chooseNextShape();
    chooseNextColor();
    displayNextShape();
    // 현재 이동시키고 있는 블럭의 shapepoint 값을 업데이트시키고
    // 그 업데이트 된 값이 적정한 값인지 검사하고 현재 지정된 색깔 값을 넣어준다.
    // 각각의 x, y 좌표값을 shapecell에 업데이트
    for (let i = 0; i < shape.length; i++) {
        let sy = shapePoint[0] + shape[i][0];
        let sx = shapePoint[1] + shape[i][1];
        if (!isValidPoint(sy, sx)) gameOver();
        let el = getElId(parseInt(sy), parseInt(sx));
        el.style.background = shapeColor;
        shapeCell.push([sy, sx]);
    }
    // 제대로 다음 블럭을 생성하면 레벨 스택을 쌓고
    // 무빙쓰레드 값을 다시 조정해준다.
    levelStack++;
    leveling();
    movingThread = setTimeout("moveDown()", movingSpeed);
}
//넥스트 테이블 값을 다시 조정한다.
function initNextTable() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            document.getElementById(String(i) + String(j)).style.background = "rgb(14,31,49)";
        }
    }
}
// 다음 보여줄 블럭 만들기
function displayNextShape() {
    initNextTable();
    let shape = shapeArray[nextShape];
    let color = shapeColorArray[nextColorIndex]
    for (let i = 0; i < 4; i++) {
        let y = shape[i][0];
        let x = shape[i][1];
        document.getElementById(String(y) + String(x)).style.background = color
    }
}
// 움직임의 범위를 추가한 뒤 추가된 범위가 적절한지 검사하는 함수
// 움직임의 범위가 설정한 범위값에서 벗어나거나 더이상 이동할 수 없을 때 false를 반환
function canMove(dy, dx) {
    for (let i = 0; i < shapeCell.length; i++) {
        let ny = shapeCell[i][0] + dy;
        let nx = shapeCell[i][1] + dx;
        if (!isValidPoint(ny, nx)) return false;
    }
    return true;
}

// 현재 블럭을 고정시키는 함수
// 고정된 블럭의 값을 가져와 existField값을 true로 바꿈
function commitExist() {
    for (let i = 0; i < shapeCell.length; i++) {
        let y = shapeCell[i][0];
        let x = shapeCell[i][1];
        existField[y][x] = true;
    }
}
//라인 인덱스를 가져와서 existfield를 조회하고 꽉찼다면 true
//하나라도 차지않은 곳이 있다면 false를 반납한다.
function isFull(lineIndex) {
    for (let i = 1; i < W - 1; i++)
        if (!existField[lineIndex][i]) return false
    // 마지막 줄까지 for문을 통과하면 true를 반환
    return true;
}
// 라인인덱스를 받아와서 그 라인을 지우는 함수
// 지울 라인이 이미 정해져 있기 때문에 그 라인부터 윗줄을 다 조회해서 
// 사라질 라인에 바로 윗줄의 색상을 모두 입히고 existField값도 가져와 붙인다.
function removeLine(lineIndex) {
    for (let i = lineIndex - 1; i >= 1; i--) {
        for (let j = 1; j < W - 1; j++) {
            getElId(i + 1, j).style.background = getElId(i, j).style.background;
            existField[i + 1][j] = existField[i][j];
        }
    }
}
// 새로 추가될 스코어값과 콤보횟수를 가져와 총 점수를 업데이트하는 함수
function updateScore(plusScore, combo) {
    let comboScore = plusScore * combo
    score += comboScore
    document.getElementById("score").innerHTML = score;
    return comboScore
}
function displayCombo(combo, finalScore) {
    let comboStr = combo + " COMBO " + finalScore;
    document.getElementById("comboField").innerHTML = comboStr
    setTimeout(function () {
        document.getElementById("comboField").innerHTML = "";
    }, 700)
}
// 각 라인들이 가득찼는지 체크하고 콤보, 점수등을 제어하는 함수
function checkLine() {
    let plusScore = level * 100;
    let combo = 0;
    let finalScore = 0;
    for (let i = H - 2; i > 1; i--) {
        if (isFull(i)) {
            removeLine(i);
            i++;
            finalScore += updateScore(plusScore, ++combo)
        }
        if (combo > 0) displayCombo(combo, finalScore)
    }
}
// 블럭에 색깔을 입히는 함수
function showShape() {
    for (let i = 0; i < shapeCell.length; i++) {
        let el = getElId(shapeCell[i][0], shapeCell[i][1]);
        el.style.background = shapeColor
    }
}
// 지금 cell에 들어가 있음 블럭을 지움
function removeShape() {
    for (let i = 0; i < shapeCell.length; i++) {
        let el = getElId(shapeCell[i][0], shapeCell[i][1]);
        el.style.background = "black"
    }
}

// 자동으로 현재의 블락이 아래로 움직이게 하는 함수
// 그 과정에서 더이상 블럭이 움직일 수 없는 곳에 닿으면
// 게임 오버인지 라인들이 가득찼는지 검사
function moveDown() {
    if (!canMove(1, 0)) {
        commitExist();
        checkLine();
        shapeCell = [];
        createShape();
        return;
    }
    removeShape();
    for (let i = 0; i < shapeCell.length; i++) shapeCell[i][0]++;
    shapePoint[0]++;
    showShape();
    movingThread = setTimeout("moveDown()", movingSpeed);
}
// rotate가 가능한지 4개지 로테이트 상황을 다 비교해 false가 한 번이라도 나오면
// false를 반환하고 함수를 끝낸다. 
function canRotate() {
    var tempShape = shapeArray[shapeRotateMap[currentShape]];
    for (var i = 0; i < 4; i++) {
        var ty = shapePoint[0] + tempShape[i][0];
        var tx = shapePoint[1] + tempShape[i][1];
        if (!isValidPoint(ty, tx)) return false;
    }
    return true;
}
// 로테이션 맵을 통해서 지금 값을 회전시킨다.
// 현재 shapepoint 값과 변화시킨 로테이트 값을 업데이트 시키고
// showshape함수를 통해서 화면에 변화된 값을 그린다.
function rotateShape() {
    if (!canRotate()) return;
    removeShape();
    shapeCell = []
    currentShape = shapeRotateMap[currentShape];
    let rotateShape = shapeArray[currentShape];
    for (let i = 0; i < 4; i++) {
        let sy = shapePoint[0] + rotateShape[i][0];
        let sx = shapePoint[1] + rotateShape[i][1];
        shapeCell.push([sy, sx]);
    }
    showShape();
}
// 좌우로 움직일 수 있는지 canmove를 통해서 확인한 후
// 델타값을 shapecell, shapepoint의 column값에 더해 옆으로 이동
function moveLR(delta) {
    if (!canMove(0, delta) || isPaused) return;
    removeShape();
    for (let i = 0; i < shapeCell.length; i++) shapeCell[i][1] += delta;
    shapePoint[1] += delta;
    showShape();
}
// 속도를 변화시켜 더 빠르게 움직이게 한다.
function moveFast() {
    if (fastMode) return;
    clearTimeout(movingThread);
    movingSpeed = fastSpeed;
    movingThread = setTimeout("moveDown()", movingThread);
    fastMode = true;
}
// 패스트모드에서 다시 느려지게 한다.
function moveSlow() {
    if (!fastMode) return;
    clearTimeout(movingThread);
    movingSpeed = initSpeed - (level * deltaSpeed);
    movingThread = setTimeout("moveDown()", movingSpeed)
    fastMode = false;
}
// 게임을 종료시키고 게임오버 메시지를 띄운다.
function gameOver() {
    clearTimeout(movingThread);
    initExistField();
    alert("[Game Over]\nLevel: " + level + "\nScore: " + score);
    document.getElementById("gameField").style.visibility = "hidden";
    document.getElementById("gameover").style.visibility = "visible";
}
// 퍼즈상태라면 게임화면이 보이고 무빙스레드 setTimeout을 다시 실행시킴
// 아니라면 퍼즈화면이 보이고 clearTimeout으로 무빙스레드를 멈춤
function pause() {
    if (isPaused) {
        movingThread = setTimeout("moveDown()", movingSpeed);
        document.getElementById("pause").style.visibility = "hidden";
        document.getElementById("gamefield").style.visibility = "visible";
        isPaused = false;
    }
    else {
        clearTimeout(movingThread);
        document.getElementById("gameField").style.visibility = "hidden";
        document.getElementById("pause").style.visibility = "visible";
        isPaused = true;
    }
}