var socket, isConnected = false;
var roomID;

var roomCurrentPlayer = 'w';


var w_unit, h_unit, board, currentPlayer = 'w';
var wpimg, wrimg, wknimg, wbimg, wqimg, wkiimg, dpimg, drimg, dknimg, dbimg, dqimg, dkiimg;

function preload(){
    wpimg = loadImage('assets/visuals/white pawn.png'); wrimg = loadImage('assets/visuals/white rook.png'); wknimg = loadImage('assets/visuals/white knight.png');  wbimg = loadImage('assets/visuals/white bishop.png'); wqimg = loadImage('assets/visuals/white queen.png'); wkiimg = loadImage('assets/visuals/white king.png'); dpimg = loadImage('assets/visuals/dark pawn.png'); drimg = loadImage('assets/visuals/dark rook.png'); dknimg = loadImage('assets/visuals/dark knight.png');  dbimg = loadImage('assets/visuals/dark bishop.png'); dqimg = loadImage('assets/visuals/dark queen.png'); dkiimg = loadImage('assets/visuals/dark king.png');
}

function setup() {
    console.log(location);
    var url = new URL(location.href);
    roomID = url.searchParams.get('r');
    console.log(roomID);

    if(roomID != null && roomID != 'local'){
        isConnected = true;
        // setup my socket client
        socket = io.connect(location.origin);
        if(roomID == 'multiplayer')
            roomID = null;
        socket.emit('readyToPlay', roomID);
        socket.on('newRoomCreated', function (room){
            console.log(room);
            history.pushState(null, null, location.origin + '/chess.html?r=' + room);
            roomID = room;
            drawChessPieces();
        })
        socket.on('boardReceived', function (data){
            console.log(data);
            board = data.board;
            roomCurrentPlayer = data.player;
            if(data.clientID != socket.id)
                boardFlip();
            drawBoard();
            drawChessPieces();

            if(checkMate()){
                var quitButton = document.getElementById('quitButton');
                quitButton.innerHTML = 'End';
                if(roomCurrentPlayer == 'd'){
                    roomCurrentPlayer = 'nomoremoves';
                    console.log("White won.");
                    quitButton.setAttribute('href', '/endscreen.html?w=w');
                    //window.location = "/endscreen.html?w=w";
                }
                if(roomCurrentPlayer == 'w'){
                    roomCurrentPlayer = 'nomoremoves';
                    console.log("Dark won.");
                    quitButton.setAttribute('href', '/endscreen.html?w=d');
                    //window.location = "/endscreen.html?w=d";
                }
            }

        })
        socket.on('connectedToRoom', function (){
            currentPlayer = 'd';
            boardFlip();
            drawBoard();
            drawChessPieces();
        })
        socket.on('checkMate', function (){
            var quitButton = document.getElementById('quitButton');
            quitButton.innerHTML = 'End';
            if(roomCurrentPlayer == 'd'){
                roomCurrentPlayer = 'nomoremoves';
                console.log("White won.");
                quitButton.setAttribute('href', '/endscreen.html?w=w');
                //window.location = "/endscreen.html?w=w";
            }
            if(roomCurrentPlayer == 'w'){
                roomCurrentPlayer = 'nomoremoves';
                console.log("Dark won.");
                quitButton.setAttribute('href', '/endscreen.html?w=d');
                //window.location = "/endscreen.html?w=d";
            }
        })
    }

    var width = (windowHeight > 800) ? 800 : 600;
    var height = (windowHeight > 800) ? 800 : 600;
    var canvas = createCanvas(width, height);
    canvas.parent('canvas');
    var button = createA('/', 'Quit');
    button.id('quitButton');
    button.parent('canvas');
    background(204, 153, 91);

    w_unit = width/8;
    h_unit = height/8;

    strokeWeight(0);
    Setup();
}

function boardFlip(){
    for(var i = 0; i < 4; i++){
        var t = board[i];
        board[i] = board[7-i];
        board[7-i] = t;
    }
    for(var i = 0; i < 8; i++){
        for(var j = 0; j < 4; j++){
            var t = board[i][j];
            board[i][j] = board[i][7-j];
            board[i][7-j] = t;
        }
    }
}

function clickable(color){
    if(currentPlayer == roomCurrentPlayer){
        if(color == 'w' && currentPlayer == 'w')
            return true;
        else if(color == 'd' && currentPlayer == 'd')
            return true;
        else
            return false;
    }
    else
        return false;
}

function changeCurrentPlayer(currentPiece){
    if(currentPiece[0] == 'w')
        currentPlayer = 'd';
    else if(currentPiece[0] == 'd')
        currentPlayer = 'w';

    roomCurrentPlayer = currentPlayer;
}

function Setup(){
    board = [['dr1', 'dkn1', 'db1', 'dq', 'dki', 'db2', 'dkn2', 'dr2'],
             ['dp1', 'dp2', 'dp3', 'dp4', 'dp5', 'dp6', 'dp7', 'dp8'],
             ['0', '0', '0', '0', '0', '0', '0', '0'],
             ['0', '0', '0', '0', '0', '0', '0', '0'],
             ['0', '0', '0', '0', '0', '0', '0', '0'],
             ['0', '0', '0', '0', '0', '0', '0', '0'],
             ['wp1', 'wp2', 'wp3', 'wp4', 'wp5', 'wp6', 'wp7', 'wp8'],
             ['wr1', 'wkn1', 'wb1', 'wq', 'wki', 'wb2', 'wkn2', 'wr2']];
    drawBoard();
    if(!isConnected)
        drawChessPieces();

}

function drawBoard(){
    background(204, 153, 91);
    stroke(0);
    strokeWeight(0);
    var i = 0; var j = 0;
    while(i < 8 && j < 8){
        fill(89, 48, 0);
        rect(i*w_unit, j*h_unit, w_unit, h_unit);
        i += 2;
        if(i >= 8){
            i = 1;
            j += 1;
            if (j % 2 == 0){
                i = 0;
            }
        }
    }
}

function drawChessPieces(){
    for(var i = 0; i < board.length; i++){
        for(var j = 0; j < board[i].length; j++){
            if (board[i][j][0] == 'd'){
                if(board[i][j][1] == 'p'){
                    imageMode(CENTER);
                    var size = resize(dpimg, 50);
                    image(dpimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);

                }
                else if(board[i][j][1] == 'r'){
                    imageMode(CENTER);
                    var size = resize(drimg, 50);
                    image(drimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
                else if(board[i][j][1] == 'k' && board[i][j][2] =='n'){
                    imageMode(CENTER);
                    var size = resize(dknimg, 50);
                    image(dknimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
                else if(board[i][j][1] == 'b'){
                    imageMode(CENTER);
                    var size = resize(dbimg, 50);
                    image(dbimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
                else if(board[i][j][1] == 'q'){
                    imageMode(CENTER);
                    var size = resize(dqimg, 50);
                    image(dqimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
                else if(board[i][j][1] == 'k' && board[i][j][2] =='i'){
                    var size = resize(dkiimg, 50);
                    image(dkiimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
            }
            else if(board[i][j][0] == 'w'){
                if(board[i][j][1] == 'p'){
                    imageMode(CENTER);
                    var size = resize(wpimg, 50);
                    image(wpimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);

                }
                else if(board[i][j][1] == 'r'){
                    imageMode(CENTER);
                    var size = resize(wrimg, 50);
                    image(wrimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
                else if(board[i][j][1] == 'k' && board[i][j][2] =='n'){
                    imageMode(CENTER);
                    var size = resize(wknimg, 50);
                    image(wknimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
                else if(board[i][j][1] == 'b'){
                    imageMode(CENTER);
                    var size = resize(wbimg, 50);
                    image(wbimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
                else if(board[i][j][1] == 'q'){
                    imageMode(CENTER);
                    var size = resize(wqimg, 50);
                    image(wqimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
                else if(board[i][j][1] == 'k' && board[i][j][2] =='i'){
                    var size = resize(wkiimg, 50);
                    image(wkiimg, j*w_unit+w_unit/2,  i*h_unit+h_unit/2, size.w, size.h);
                }
            }
        }
    }
}

function resize(image, percent){
    var newWidth = percent*image.width/100;
    var newHeight = percent*image.height/100;
    return {w: newWidth, h: newHeight};
}

var moves = [0], movable = false, piece, place;
function mouseReleased(){
    //console.table(board);
    var selected = identify();

    if(movable && JSON.stringify(moves).indexOf(JSON.stringify([selected[1], selected[0]])) == -1){//movable de helytelen targetpozicio
        movable = false;
        moves = undefined;
    }

    if(movable && JSON.stringify(moves).indexOf(JSON.stringify([selected[1], selected[0]])) != -1){
        if(kingNotInDangerAfterMove(piece, [selected[1], selected[0]], place)){
            console.log("king not in danger");
            board[selected[1]][selected[0]] = piece;
            board[place[0]][place[1]] = '0';
            place = 0;
            movable = false;

            if(isConnected){

                socket.emit('moveHappened', {id: roomID, board: board});
            }
            else {
                changeCurrentPlayer(piece);

                if(checkMate()){
                    var quitButton = document.getElementById('quitButton');
                    quitButton.innerHTML = 'End';
                    if(roomCurrentPlayer == 'd'){
                        roomCurrentPlayer = 'nomoremoves';
                        console.log("White won.");
                        quitButton.setAttribute('href', '/endscreen.html?w=w');
                        //window.location = "/endscreen.html?w=w";
                    }
                    if(roomCurrentPlayer == 'w'){
                        roomCurrentPlayer = 'nomoremoves';
                        console.log("Dark won.");
                        quitButton.setAttribute('href', '/endscreen.html?w=d');
                        //window.location = "/endscreen.html?w=d";
                    }
                }
            }

        }
        else{
            console.log("king is in danger");
            place = 0;
            movable = false;
            piece = 0;
            drawBoard();
            drawChessPieces();
            return;
        }
    }

    drawBoard();
    drawChessPieces();

    if(piece == board[selected[1]][selected[0]]){//hogy lehessen ujbol raklikkelni ahhoz hogy eltunjenek a moveok
        piece = 0;
        return;
    }

    if(!movable && piece != board[selected[1]][selected[0]] && clickable(board[selected[1]][selected[0]][0])){
        piece = board[selected[1]][selected[0]];
        place = [selected[1], selected[0]];
        moves = possibleMoves(piece, selected);

        if(moves != undefined){
            movable = true;
            drawMoves(moves);
        }
    }
}

function checkMate(){//CHECKMATE SITUATION
    var checkmate = true;
    for(var i = 0; i < 8; i++){
        for(var j = 0; j < 8; j++){
            if(board[i][j][0] == roomCurrentPlayer){
                var currentpiecemoves = possibleMoves(board[i][j], [j, i], roomCurrentPlayer, board);
                for(let k in currentpiecemoves){
                    console.log(currentpiecemoves[k]);
                    if(kingNotInDangerAfterMove(board[i][j], currentpiecemoves[k], [i, j]/*, board, roomCurrentPlayer*/)){
                        console.log(board[i][j] + "megy a " + currentpiecemoves[k][0] + currentpiecemoves[k][1] + "-ra es akkor rendben lesz minden.");
                        checkmate = false;
                        i = 8; j = 8; break;
                    }
                }
            }
        }
    }
    return checkmate;
}

function kingNotInDangerAfterMove(piece, moveTo, moveFrom){
    var initialBoard = cloneArray(board, initialBoard);
    board[moveFrom[0]][moveFrom[1]] = '0';
    board[moveTo[0]][moveTo[1]] = piece;
    var kingPos = findKing(roomCurrentPlayer);
    for(var i = 0; i < 8; i++){
        for(var j = 0; j < 8; j++){
            if(board[i][j][0] != roomCurrentPlayer){
                if(board[i][j] != 0){
                    var cellsEndangered = possibleMoves(board[i][j], [j, i]);
                    if(cellsEndangered != undefined){
                        for(var k = 0; k < cellsEndangered.length; k++){
                            if(kingPos[0] == cellsEndangered[k][0] && kingPos[1] == cellsEndangered[k][1]){
                                board = cloneArray(initialBoard, board);
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }
    board = cloneArray(initialBoard, board);
    return true;
}

function findKing(player){
    for(var i = 0; i < 8; i++){
        for(var j = 0; j < 8; j++){
            if(board[i][j] == player.concat('ki'))
                return [i, j];
        }
    }
    return 0;
}

function identify(){
    var y = int(mouseY/h_unit);
    var x = int(mouseX/w_unit);
    return [x, y];
}

function possibleMoves(piece, selected){//selected[1]/[0] <--koordinatak a matrixban
    var checker = true;
    if(new Error().stack.indexOf('kingNotInDangerAfterMove') != -1){//hogy a pawnok veszelyeztetesi mezoibe ne szamolja bele az elore menetelt, mikor sakkhelyzeteket nezunk
        checker = false;
    }
    var moveList = [0];
    var i = 0;
    if(piece[1] == 'p'){//PAWN
        if(!isConnected || (isConnected && currentPlayer == 'w')){
            if(piece[0] == 'w'){//white pawn
                if(selected[1]-1 >= 0 && board[selected[1]-1][selected[0]] == '0' && checker){//1 ahead
                    moveList[i] = [selected[1]-1, selected[0]];
                    i++;
                }
                if(selected[1]-2 >= 0 && board[selected[1]-2][selected[0]] == '0' && board[selected[1]-1][selected[0]] == '0' && selected[1] ==  6 && checker){//2 ahead
                    moveList[i] = [selected[1]-2, selected[0]];
                    i++;
                }
                if(selected[1] !=  0 && selected[0] !=  0 && board[selected[1]-1][selected[0]-1][0] == 'd'){//left up
                    moveList[i] = [selected[1]-1, selected[0]-1];
                    i++;
                }
                if(selected[1] !=  0 && selected[0] !=  7 && board[selected[1]-1][selected[0]+1][0] == 'd'){//right up
                    moveList[i] = [selected[1]-1, selected[0]+1];
                    i++;
                }
            }

            if(piece[0] == 'd'){//dark pawn
                if(selected[1]+1 < 8 && board[selected[1]+1][selected[0]] == '0' && checker){//1 ahead
                    moveList[i] = [selected[1]+1, selected[0]];
                    i++;
                }
                if(selected[1]+2 < 8 && board[selected[1]+2][selected[0]] == '0' && board[selected[1]+1][selected[0]] == '0' && selected[1] ==  1 && checker){//2 ahead
                    moveList[i] = [selected[1]+2, selected[0]];
                    i++;
                }
                if(selected[0] !=  0 && board[selected[1]+1][selected[0]-1][0] == 'w'){//left down
                    moveList[i] = [selected[1]+1, selected[0]-1];
                    i++;
                }
                if(selected[0] !=  7 && board[selected[1]+1][selected[0]+1][0] == 'w'){//right down
                    moveList[i] = [selected[1]+1, selected[0]+1];
                    i++;
                }
            }
        }
        else if(isConnected && currentPlayer == 'd'){
            if(piece[0] == 'd'){//dark pawn
                if(selected[1]-1 >= 0 && board[selected[1]-1][selected[0]] == '0' && checker){//1 ahead
                    moveList[i] = [selected[1]-1, selected[0]];
                    i++;
                }
                if(selected[1]-2 >= 0 && board[selected[1]-2][selected[0]] == '0' && board[selected[1]-1][selected[0]] == '0' && selected[1] ==  6 && checker){//2 ahead
                    moveList[i] = [selected[1]-2, selected[0]];
                    i++;
                }
                if(selected[1] !=  0 && selected[0] !=  0 && board[selected[1]-1][selected[0]-1][0] == 'w'){//left up
                    moveList[i] = [selected[1]-1, selected[0]-1];
                    i++;
                }
                if(selected[1] !=  0 && selected[0] !=  7 && board[selected[1]-1][selected[0]+1][0] == 'd'){//right up
                    moveList[i] = [selected[1]-1, selected[0]+1];
                    i++;
                }
            }

            if(piece[0] == 'w'){//white pawn
                if(selected[1]+1 < 8 && board[selected[1]+1][selected[0]] == '0' && checker){//1 ahead
                    moveList[i] = [selected[1]+1, selected[0]];
                    i++;
                }
                if(selected[1]+2 < 8 && board[selected[1]+2][selected[0]] == '0' && board[selected[1]+1][selected[0]] == '0' && selected[1] ==  1 && checker){//2 ahead
                    moveList[i] = [selected[1]+2, selected[0]];
                    i++;
                }
                if(selected[0] !=  0 && board[selected[1]+1][selected[0]-1][0] == 'w'){//left down
                    moveList[i] = [selected[1]+1, selected[0]-1];
                    i++;
                }
                if(selected[0] !=  7 && board[selected[1]+1][selected[0]+1][0] == 'w'){//right down
                    moveList[i] = [selected[1]+1, selected[0]+1];
                    i++;
                }
            }
        }
    }
    if(piece[1] == 'r'){//ROOK
        for(var j = selected[0] + 1; j < 8; j++){//horizontal right
            if(board[selected[1]][j][0] != board[selected[1]][selected[0]][0]){
                if(board[selected[1]][j] == '0'){
                    moveList[i] = [selected[1], j];
                    i++;
                    continue;
                }
                moveList[i] = [selected[1], j];
                i++;
                break;
            }
            else
                break;
        }
        for(var j = selected[0] - 1; j >= 0; j--){//horizontal left
            if(board[selected[1]][j][0] != board[selected[1]][selected[0]][0]){
                if(board[selected[1]][j] == '0'){
                    moveList[i] = [selected[1], j];
                    i++;
                    continue;
                }
                moveList[i] = [selected[1], j];
                i++;
                break;
            }
            else
                break;
        }
        for(var j = selected[1] + 1; j < 8; j++){//vertical down
            if(board[j][selected[0]][0] != board[selected[1]][selected[0]][0]){
                if(board[j][selected[0]][0] == '0'){
                    moveList[i] = [j, selected[0]];
                    i++;
                    continue;
                }
                moveList[i] = [j, selected[0]];
                i++;
                break;
            }
            else
                break;
        }
        for(var j = selected[1] - 1; j >= 0; j--){//vertical up
            if(board[j][selected[0]][0] != board[selected[1]][selected[0]][0]){
                if(board[j][selected[0]][0] == '0'){
                    moveList[i] = [j, selected[0]];
                    i++;
                    continue;
                }
                moveList[i] = [j, selected[0]];
                i++;
                break;
            }
            else
                break;
        }
    }
    if(piece[1] == 'k' && piece[2] == 'n'){//KNIGHT
        if(selected[1]-2 >= 0 && selected[0]+1 <= 7 && (board[selected[1]-2][selected[0]+1] == '0' || board[selected[1]-2][selected[0]+1][0] != board[selected[1]][selected[0]][0])){//up-right
            moveList[i] = [selected[1]-2, selected[0]+1];
            i++;
        }
        if(selected[1]-1 >= 0 && selected[0]+2 <= 7 && (board[selected[1]-1][selected[0]+2] == '0' || board[selected[1]-1][selected[0]+2][0] != board[selected[1]][selected[0]][0])){//upper-mid-right
            moveList[i] = [selected[1]-1, selected[0]+2];
            i++;
        }
        if(selected[1]+1 <= 7 && selected[0]+2 <= 7 && (board[selected[1]+1][selected[0]+2] == '0' || board[selected[1]+1][selected[0]+2][0] != board[selected[1]][selected[0]][0])){//lower-mid-right
            moveList[i] = [selected[1]+1, selected[0]+2];
            i++;
        }
        if(selected[1]+2 <= 7 && selected[0]+1 <= 7 && (board[selected[1]+2][selected[0]+1] == '0' || board[selected[1]+2][selected[0]+1][0] != board[selected[1]][selected[0]][0])){//down-right
            moveList[i] = [selected[1]+2, selected[0]+1];
            i++;
        }
        if(selected[1]+2 <= 7 && selected[0]-1 >= 0 && (board[selected[1]+2][selected[0]-1] == '0' || board[selected[1]+2][selected[0]-1][0] != board[selected[1]][selected[0]][0])){//down-left
            moveList[i] = [selected[1]+2, selected[0]-1];
            i++;
        }
        if(selected[1]+1 <= 7 && selected[0]-2 >= 0 && (board[selected[1]+1][selected[0]-2] == '0' || board[selected[1]+1][selected[0]-2][0] != board[selected[1]][selected[0]][0])){//lower-mid-left
            moveList[i] = [selected[1]+1, selected[0]-2];
            i++;
        }
        if(selected[1]-1 >= 0 && selected[0]-2 >= 0 && (board[selected[1]-1][selected[0]-2] == '0' || board[selected[1]-1][selected[0]-2][0] != board[selected[1]][selected[0]][0])){//upper-mid-left
            moveList[i] = [selected[1]-1, selected[0]-2];
            i++;
        }
        if(selected[1]-2 >= 0 && selected[0]-1 >= 0 && (board[selected[1]-2][selected[0]-1] == '0' || board[selected[1]-2][selected[0]-1][0] != board[selected[1]][selected[0]][0])){//up-left
            moveList[i] = [selected[1]-2, selected[0]-1];
            i++;
        }
    }
    if(piece[1] == 'b'){//BISHOP
        var y = selected[0]+1;//oszlopszam - 0. elem
        var x = selected[1]+1;//sorszam
        while(x < 8 && y < 8){//right-down
            if(board[x][y][0] != board[selected[1]][selected[0]][0]){
                if(board[x][y] == '0'){
                    moveList[i] = [x, y];
                    i++;
                }
                else {
                    moveList[i] = [x, y];
                    i++;
                    break;
                }
            }
            else
                break;
            x++; y++;
        }
        x = selected[1] - 1; y = selected[0] - 1;
        while(x >= 0 && y >= 0){//left-up
            if(board[x][y][0] != board[selected[1]][selected[0]][0]){
                if(board[x][y] == '0'){
                    moveList[i] = [x, y];
                    i++;
                }
                else {
                    moveList[i] = [x, y];
                    i++;
                    break;
                }
            }
            else
                break;
            x--; y--;
        }
        x = selected[1] - 1; y = selected[0] + 1;
        while(x >= 0 && y < 8){//right-up
            if(board[x][y][0] != board[selected[1]][selected[0]][0]){
                if(board[x][y] == '0'){
                    moveList[i] = [x, y];
                    i++;
                }
                else {
                    moveList[i] = [x, y];
                    i++;
                    break;
                }
            }
            else
                break;
            x--; y++;
        }
        x = selected[1] + 1; y = selected[0] - 1;
        while(x < 8 && y >= 0){//left-down

            if(board[x][y][0] != board[selected[1]][selected[0]][0]){
                if(board[x][y] == '0'){
                    moveList[i] = [x, y];
                    i++;
                }
                else {
                    moveList[i] = [x, y];
                    i++;
                    break;
                }
            }
            else
                break;
            x++; y--;
        }
    }
    if(piece[1] == 'q'){//QUEEN
        for(var j = selected[0] + 1; j < 8; j++){//horizontal right
            if(board[selected[1]][j][0] != board[selected[1]][selected[0]][0]){
                if(board[selected[1]][j] == '0'){
                    moveList[i] = [selected[1], j];
                    i++;
                    continue;
                }
                moveList[i] = [selected[1], j];
                i++;
                break;
            }
            else
                break;
        }
        for(var j = selected[0] - 1; j >= 0; j--){//horizontal left
            if(board[selected[1]][j][0] != board[selected[1]][selected[0]][0]){
                if(board[selected[1]][j] == '0'){
                    moveList[i] = [selected[1], j];
                    i++;
                    continue;
                }
                moveList[i] = [selected[1], j];
                i++;
                break;
            }
            else
                break;
        }
        for(var j = selected[1] + 1; j < 8; j++){//vertical down
            if(board[j][selected[0]][0] != board[selected[1]][selected[0]][0]){
                if(board[j][selected[0]][0] == '0'){
                    moveList[i] = [j, selected[0]];
                    i++;
                    continue;
                }
                moveList[i] = [j, selected[0]];
                i++;
                break;
            }
            else
                break;
        }
        for(var j = selected[1] - 1; j >= 0; j--){//vertical up
            if(board[j][selected[0]][0] != board[selected[1]][selected[0]][0]){
                if(board[j][selected[0]][0] == '0'){
                    moveList[i] = [j, selected[0]];
                    i++;
                    continue;
                }
                moveList[i] = [j, selected[0]];
                i++;
                break;
            }
            else
                break;
        }
        var y = selected[0]+1;//oszlopszam - 0. elem
        var x = selected[1]+1;//sorszam
        while(x < 8 && y < 8){//right-down
            if(board[x][y][0] != board[selected[1]][selected[0]][0]){
                if(board[x][y] == '0'){
                    moveList[i] = [x, y];
                    i++;
                }
                else {
                    moveList[i] = [x, y];
                    i++;
                    break;
                }
            }
            else
                break;
            x++; y++;
        }
        x = selected[1] - 1; y = selected[0] - 1;
        while(x >= 0 && y >= 0){//left-up
            if(board[x][y][0] != board[selected[1]][selected[0]][0]){
                if(board[x][y] == '0'){
                    moveList[i] = [x, y];
                    i++;
                }
                else {
                    moveList[i] = [x, y];
                    i++;
                    break;
                }
            }
            else
                break;
            x--; y--;
        }
        x = selected[1] - 1; y = selected[0] + 1;
        while(x >= 0 && y < 8){//right-up
            if(board[x][y][0] != board[selected[1]][selected[0]][0]){
                if(board[x][y] == '0'){
                    moveList[i] = [x, y];
                    i++;
                }
                else {
                    moveList[i] = [x, y];
                    i++;
                    break;
                }
            }
            else
                break;
            x--; y++;
        }
        x = selected[1] + 1; y = selected[0] - 1;
        while(x < 8 && y >= 0){//left-down

            if(board[x][y][0] != board[selected[1]][selected[0]][0]){
                if(board[x][y] == '0'){
                    moveList[i] = [x, y];
                    i++;
                }
                else {
                    moveList[i] = [x, y];
                    i++;
                    break;
                }
            }
            else
                break;
            x++; y--;
        }
    }
    if(piece[1] == 'k' && piece[2] == 'i'){//KING
        if(selected[1]-1 >= 0 && board[selected[1]-1][selected[0]][0] != board[selected[1]][selected[0]][0]){//up
            moveList[i] = [selected[1]-1, selected[0]];
            i++;
        }
        if(selected[0]+1 < 8 && selected[1]-1 >= 0 && board[selected[1]-1][selected[0]+1][0] != board[selected[1]][selected[0]][0]){//right-up
            moveList[i] = [selected[1]-1, selected[0]+1];
            i++;
        }
        if(selected[0]+1 < 8 && board[selected[1]][selected[0]+1][0] != board[selected[1]][selected[0]][0]){//right
            moveList[i] = [selected[1], selected[0]+1];
            i++;
        }
        if(selected[0]+1 < 8 && selected[1]+1 < 8 && board[selected[1]+1][selected[0]+1][0] != board[selected[1]][selected[0]][0]){//right-down
            moveList[i] = [selected[1]+1, selected[0]+1];
            i++;
        }
        if(selected[1]+1 < 8 && board[selected[1]+1][selected[0]][0] != board[selected[1]][selected[0]][0]){//down
            moveList[i] = [selected[1]+1, selected[0]];
            i++;
        }
        if(selected[0]-1 >= 0 && selected[1]+1 < 8 && board[selected[1]+1][selected[0]-1][0] != board[selected[1]][selected[0]][0]){//left-down
            moveList[i] = [selected[1]+1, selected[0]-1];
            i++;
        }
        if(selected[0]-1 >= 0 && board[selected[1]][selected[0]-1][0] != board[selected[1]][selected[0]][0]){//left
            moveList[i] = [selected[1], selected[0]-1];
            i++;
        }
        if(selected[0]-1 >= 0 && selected[1]-1 >= 0 && board[selected[1]-1][selected[0]-1][0] != board[selected[1]][selected[0]][0]){//left-up
            moveList[i] = [selected[1]-1, selected[0]-1];
            i++;
        }
    }
    if(moveList != 0)
        return moveList;
}

function drawMoves(toDraw){
    for(var i = 0; i < toDraw.length; i++){
        // noFill();
        // stroke(5, 153, 3);
        // strokeWeight(4);
        // rect(toDraw[i][1]*w_unit+2, toDraw[i][0]*h_unit+2, w_unit-4, h_unit-4);
        fill(2, 104, 1);
        ellipse(toDraw[i][1]*w_unit+w_unit/2, toDraw[i][0]*h_unit+h_unit/2, w_unit/5);
    }
}

function consoleBoard(arr){
    for(var i = 0; i < arr.length; i++){
        for(var j = 0; j < arr[i].length; j++){
            console.log(arr[i][j]);
        }
    }
}

function cloneArray(arr1, arr2){
    var arr2 = [];
    for(var i = 0; i < arr1.length; i++){
        arr2.push([]);
        for(var j = 0; j < arr1[i].length; j++){
            arr2[i][j] = arr1[i][j];
        }
    }
    return arr2;
}
