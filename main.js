
const token = 'lip_B6kCKgIlDNBdxtJr3V7Z'

let max = 12
let current_diff = 'easy'

let user_checkmate = false
let enemy_checkmate = false



document.querySelector('#difficulty').innerText = current_diff

const change_difficulty = () => {
    if(current_diff == 'easy'){
        current_diff = 'hard'
        max = 3;
    } else if(current_diff=='hard'){
        current_diff = 'impossible'
        max = 1;
    } else if (current_diff == 'impossible'){
        current_diff = 'easy'
        max = 7;
    }
    document.querySelector('#difficulty').innerText = current_diff
}

active_piece = {
    x: null,
    y: null,
    color: null,
    piece: null,
    enemy: null
}

let turn = 'white'
let _black_in_check = false
let _white_in_check = false
let _white_can_castle_king = true
let _black_can_castle_king = true
let _white_can_castle_queen = true
let _black_can_castle_queen = true
let turns = 0

function handle_click(target){
    if(user_checkmate || enemy_checkmate){return}
    data = get_square_data(target)
    has_piece = target_has_piece(target)

    if(is_move_square(target)){ // If clicking on a move
        move_piece(target)
        _white_in_check = white_in_check()
        _black_in_check = black_in_check()
        if(turn=='white' && _white_in_check){
            undo_move(target)
            clear_active_piece()
            remove_active()
            clear_moves_from_board()
        } else if(turn=='black' && _black_in_check){
            undo_move(target)
            clear_active_piece()
            remove_active()
            clear_moves_from_board()
        } else {
            clear_active_piece()
            remove_active()
            clear_moves_from_board()
            let check_for_end_of_game = end_turn()
            if(check_for_end_of_game>0){return}
            _white_in_check = white_in_check()
            _black_in_check = black_in_check()
        }
    } else if(is_capture_square(target)){ // if clicking on a capture
        let captured_piece = capture_piece(target)
        _white_in_check = white_in_check()
        _black_in_check = black_in_check()
        if(turn=='white' && _white_in_check){
            undo_capture(target, captured_piece)
            clear_active_piece()
            remove_active()
            clear_moves_from_board() 
        } else if(turn=='black' && _black_in_check){
            undo_capture(target, captured_piece)
            clear_active_piece()
            remove_active()
            clear_moves_from_board()         
        } else {
            clear_active_piece()
            remove_active()
            clear_moves_from_board()
            let check_for_end_of_game = end_turn()
            if(check_for_end_of_game>0){return}
            _white_in_check = white_in_check()
            _black_in_check = black_in_check()
        }

    }
    else if(has_piece){ // if clicking on a piece
        if(data.color != turn){return}
        if(data.x == active_piece.x && data.y == active_piece.y){
            clear_active_piece()
            remove_active()
            clear_moves_from_board()            
        } else {
            clear_active_piece()
            remove_active()
            clear_moves_from_board()
            select_piece(data)
            mark_as_active(target)  
            let moves = get_base_possible_moves(data)
            paint_moves(moves)
        }
    } else {
        clear_active_piece()
        remove_active()
        clear_moves_from_board()
    }
    if(_white_in_check){
        paint_check('white')
    } else if(_black_in_check){
        paint_check('black')
    } else {
        clear_checks()
    }
    
}

function clear_checks(){
    let squares = document.querySelectorAll('.row')
    for(let sq of squares){
        sq.classList.remove('check')
    }
}

function move_piece(target){
    let target_data = get_square_data(target)
    if(active_piece.piece == 'king' && target_data.x == active_piece.x + 2){
        old_square = get_square(active_piece.x, active_piece.y, 0, 0)
        old_square.classList.remove(active_piece.piece)
        old_square.classList.remove(active_piece.color)
        target.classList.add(active_piece.piece)
        target.classList.add(active_piece.color)
        let rook = null
        let new_rook = null
        if(active_piece.color == 'white'){
            rook = get_square(7,0,0,0)
            new_rook = get_square(5,0,0,0)
        } else {
            rook = get_square(7,7,0,0)
            new_rook = get_square(5,7,0,0)
        }

        rook.classList.remove('rook')
        rook.classList.remove(active_piece.color)
        new_rook.classList.add('rook')
        new_rook.classList.add(active_piece.color)
        if(active_piece.color=='white'){
            _white_can_castle_king = false;
            _white_can_castle_queen = false;
        } else if(active_piece.color=='black'){
            _black_can_castle_king = false;
            _black_can_castle_queen = false;
        }
    } else if(active_piece.piece == 'king' && target_data.x == active_piece.x - 2){
        old_square = get_square(active_piece.x, active_piece.y, 0, 0)
        old_square.classList.remove(active_piece.piece)
        old_square.classList.remove(active_piece.color)
        target.classList.add(active_piece.piece)
        target.classList.add(active_piece.color)
        let rook = null
        let new_rook = null
        if(active_piece.color == 'white'){
            rook = get_square(0,0,0,0)
            new_rook = get_square(3,0,0,0)
        } else {
            rook = get_square(0,7,0,0)
            new_rook = get_square(3,7,0,0)
        }

        rook.classList.remove('rook')
        rook.classList.remove(active_piece.color)
        new_rook.classList.add('rook')
        new_rook.classList.add(active_piece.color)
        if(active_piece.color=='white'){
            _white_can_castle_queen = false;
            _white_can_castle_king = false;
        } else if(active_piece.color=='black'){
            _black_can_castle_queen = false;
            _black_can_castle_king = false;
        } 
    } else {
        old_square = get_square(active_piece.x, active_piece.y, 0, 0)
        old_square.classList.remove(active_piece.piece)
        old_square.classList.remove(active_piece.color)
        target.classList.add(active_piece.piece)
        target.classList.add(active_piece.color)
    }

}

function capture_piece(target){
    data = get_square_data(target)
    old_square = get_square(active_piece.x, active_piece.y, 0, 0)
    old_square.classList.remove(active_piece.piece)
    old_square.classList.remove(active_piece.color)
    target.classList.remove(data.piece)
    target.classList.remove(data.color)
    target.classList.add(active_piece.piece)
    target.classList.add(active_piece.color)  
    return data  
}

function undo_capture(target, captured_piece_data){

    return_square = get_square(active_piece.x, active_piece.y, 0, 0)

    return_square.classList.add(active_piece.piece)
    return_square.classList.add(active_piece.color)
    target.classList.remove(active_piece.piece)
    target.classList.remove(active_piece.color) 

    target.classList.add(captured_piece_data.piece)
    target.classList.add(captured_piece_data.color)

}

function paint_check(color){
    let king = document.querySelector(`.${color}.king`)
    king.classList.add('check')
    
}

function undo_move(target){
    old_square = get_square(active_piece.x, active_piece.y, 0, 0)
    target.classList.remove(active_piece.piece)
    target.classList.remove(active_piece.color)
    old_square.classList.add(active_piece.color)
    old_square.classList.add(active_piece.piece)
}

function is_move_square(target){
    return target.classList.contains('move')
}

function is_capture_square(target){
    return target.classList.contains('capture')
}

function all_squares(){
    return document.querySelectorAll('.row')
}

function mark_as_active(target){
    target.classList.add('active')
}

function remove_active(){
    let sqs = all_squares();
    for(sq of sqs){
        sq.classList.remove('active')
    }
}

function get_square_data(target){

    let x = parseInt(target.id[0])
    let y = parseInt(target.id.slice(-1))
    let color = get_color(target)
    if(color){
        enemy = color == 'white' ? 'black' : 'white'
    } else {
        enemy = null
    }
    let piece = null

    if(target.classList.contains('pawn')){
        piece = 'pawn'
    } else if(target.classList.contains('bishop')){
        piece = 'bishop'
    } else if(target.classList.contains('rook')){
        piece = 'rook'
    } else if(target.classList.contains('knight')){
        piece = 'knight'
    } else if(target.classList.contains('queen')){
        piece = 'queen'
    } else if(target.classList.contains('king')){
        piece = 'king'
    } else {
        piece = null // if not piece, return false
    }

    const data = {
        x: x,
        y: y,
        color: color,
        piece: piece,
        enemy: enemy
    }
    return data
}

async function end_turn(){
    if(turn=='white'){

        squares = document.querySelectorAll('.row')
        for(sq of squares){
            if(sq.classList.contains('from')){
                sq.classList.remove('from')
            } else if(sq.classList.contains('to')){
                sq.classList.remove('to')
            }
        }

        turn = 'black'

        let [let_comp_move, is_checkmate] = await get_move()

        if(let_comp_move == 'ENEMY CHECKMATE'){
            document.querySelector('#message').innerText ='CHECKMATE'
            document.querySelector('#message').classList.remove('blink')
            enemy_checkmate = true
            return 2
        }

        let piece = let_comp_move.slice(0,2)
        let square = let_comp_move.slice(2,4)
        piece = get_fen_square(piece)
        square = get_fen_square(square)
        piece.classList.add('from')
        square.classList.add('to')

        let piece_data = get_square_data(piece)
        
        select_piece(piece_data)
        
        if(target_has_piece(square)){
            capture_piece(square)
        } else {
            move_piece(square)
        }
        _white_in_check = white_in_check()
        _black_in_check = black_in_check()
        if(_white_in_check){
            paint_check('white')
        } else if(_black_in_check){
            paint_check('black')
        } else {
            clear_checks()
        }

        if(is_checkmate){
            user_checkmate = true
            document.querySelector('#message').innerText ='CHECKMATE'
            document.querySelector('#message').classList.remove('blink')
            return 1
        }

        end_turn()

    } else {
        
        turn = 'white'
        turns++
        return 0
    }
}

function get_fen_square(fen){
    let column = fen[0]
    let row = fen[1]-1
    let column_num = column.charCodeAt(0)-97
    return get_square(column_num,row,0,0)

}

function get_color(target){
    if(target.classList.contains('white')){
        return 'white'
    } else if (target.classList.contains('black')){
        return 'black'
    } else {
        return null
    }
}

function clear_active_piece(){
    active_piece.x = null;
    active_piece.y = null;
    active_piece.piece = null;
    active_piece.color = null;
    active_piece.enemy = null;    
}

function select_piece(data){
    active_piece.x = data.x;
    active_piece.y = data.y;
    active_piece.piece = data.piece;
    active_piece.color = data.color;
    active_piece.enemy = data.enemy;
}

function piece_is_active(){
    return active_piece.piece==null ? false : true;
}

function target_has_piece(target){
    data = get_square_data(target)
    if(data.piece==null && data.color==null){
        return false
    } else {
        return true
    }
}

function data_has_piece(data){
    if(data.piece==null && data.color==null){
        return false
    } else {
        return true
    }
}

function clear_moves_from_board(){
    squares = document.querySelectorAll('.row')
    for(square of squares){
        if(square.classList.contains('move')){
            square.classList.remove('move')
        }
        if(square.classList.contains('capture')){
            square.classList.remove('capture')
        }        
        if(square.classList.contains('check')){
            square.classList.remove('check')
        }     
    } 
}

//

function get_all_pieces(color){
    let pawns = document.querySelectorAll(`.pawn.${color}`)
    let knights = document.querySelectorAll(`.knight.${color}`)
    let bishops = document.querySelectorAll(`.bishop.${color}`)
    let rooks = document.querySelectorAll(`.rook.${color}`)
    let queen = document.querySelectorAll(`.queen.${color}`)
    return [...pawns, ...knights, ...bishops, ...rooks, ...queen]
}

function get_all_moves(pieces){
    let moves = []
    for(piece of pieces){
        data = get_square_data(piece)
        moves.push(...get_base_possible_moves(data))
    }
    return moves
}

function target_has_king(target, color){
    
    if(target_has_piece(target)){
        let data = get_square_data(target)
        if(data.piece == 'king' && data.color == color){
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

function white_in_check(){
    let pieces = get_all_pieces('black')
    let moves = get_all_moves(pieces)

    for(move of moves){

        if(target_has_king(move, 'white')){
            return move
        }
    }
    return false
}

function black_in_check(){
    let pieces = get_all_pieces('white')
    let moves = get_all_moves(pieces)
    for(move of moves){
        if(target_has_king(move, 'black')){
            return move
        }
    }
    return false
}
// MOVES

function get_square(start_x, start_y, x, y){
    try {
        return document.getElementById(`${start_x+x}-${start_y+y}`)
    } catch(e){
        return false
    }
}

function get_base_possible_moves(data){
    const moves = []

    if(data.piece == 'pawn'){
        if(data.color=='white'){
            moves.push(get_square(data.x, data.y,0,1))
            if(data.y==1){
                moves.push(get_square(data.x, data.y, 0, 2))
            }
            if(data.x!=0 && get_square(data.x, data.y, -1, 1).classList.contains(enemy)){
                moves.push(get_square(data.x, data.y, -1, 1))
            }
            if(data.x!= 7 && get_square(data.x, data.y, 1, 1).classList.contains(enemy)){
                moves.push(get_square(data.x, data.y, 1, 1))
            } 

        } else if(data.color == 'black'){
            moves.push(get_square(data.x, data.y,0,-1))
            if(data.y==6){
                moves.push(get_square(data.x, data.y, 0, -2))
            }
            if(data.x!=0 && get_square(data.x, data.y, -1, -1).classList.contains(enemy)){
                moves.push(get_square(data.x, data.y, -1, -1))
            }
            if(data.x!= 7 && get_square(data.x, data.y, 1, -1).classList.contains(enemy)){
                moves.push(get_square(data.x, data.y, 1, -1))
            }             
        }
        
               
    } else if(data.piece == 'bishop'){
        moves.push(...get_diagonal(data.x, data.y, 1, 1, data.color))
        moves.push(...get_diagonal(data.x, data.y, -1, 1, data.color))
        moves.push(...get_diagonal(data.x, data.y, 1, -1, data.color))
        moves.push(...get_diagonal(data.x, data.y, -1, -1, data.color))
    } else if(data.piece == 'rook'){
        moves.push(...get_column(data.x, data.y, data.color))
        moves.push(...get_row(data.x, data.y, data.color))
    } else if(data.piece == 'king'){
        if(data.color == 'white'){
            let one_over = get_square(data.x, data.y,1,0)
            let two_over = get_square(data.x, data.y,2,0)
            let minus_one_over = get_square(data.x, data.y, -1, 0)
            let minus_two_over = get_square(data.x, data.y, -2, 0)
            if(_white_can_castle_king && !one_over.classList.contains('white') && !two_over.classList.contains('white')){
                moves.push(get_square(data.x,data.y,2,0))
            }
            if(_white_can_castle_queen && !minus_one_over.classList.contains('white') && !minus_two_over.classList.contains('white')){
                moves.push(get_square(data.x,data.y,-2,0))
            }
        }
        moves.push(...get_king_moves(data.x, data.y, data.color))

    } else if(data.piece == 'queen'){
        moves.push(...get_diagonal(data.x, data.y, 1, 1, data.color))
        moves.push(...get_diagonal(data.x, data.y, -1, 1, data.color))
        moves.push(...get_diagonal(data.x, data.y, 1, -1, data.color))
        moves.push(...get_diagonal(data.x, data.y, -1, -1, data.color))
        moves.push(...get_column(data.x, data.y, data.color))
        moves.push(...get_row(data.x, data.y, data.color))
        moves.push(...get_king_moves(data.x, data.y, data.color))
    } else if(data.piece == 'knight'){
        moves.push(...get_knight_moves(data.x, data.y, data.color))
    }

    return moves
}

function get_row(start_x, start_y, color){
    const moves = []
    right_start = start_x + 1
    left_start = start_x - 1
    let enemy = color=='white' ? 'black' : 'white'
    while(right_start < 8){
        let sq = document.getElementById(`${right_start}-${start_y}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
            break;
        } else if(sq.classList.contains(data.color)){
            break;
        } else {
            moves.push(sq)
        }        
        right_start++
    }
    while(left_start >=0 ){
        let sq = document.getElementById(`${left_start}-${start_y}`)

        if(sq.classList.contains(enemy)){
            moves.push(sq)
            break;
        } else if(sq.classList.contains(data.color)){
            break;
        } else {
            moves.push(sq)
        }        
        left_start--
    }
    return moves
}

function get_king_moves(start_x, start_y, color){
    const moves = [];

    let enemy = color=='white' ? 'black' : 'white'

    try {
        let sq = document.getElementById(`${start_x+1}-${start_y+1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }  
    } catch(e){
        let x = e
    }

    try {
        let sq = document.getElementById(`${start_x+1}-${start_y}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }  
    } catch(e){
        let x = e
    }

    try {
        let sq = document.getElementById(`${start_x+1}-${start_y-1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }  
    } catch(e){
        let x = e
    }
    try {
        let sq = document.getElementById(`${start_x}-${start_y+1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }  
    } catch(e){
        let x = e
    }
    try {
        let sq = document.getElementById(`${start_x}-${start_y-1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }  
    } catch(e){
        let x = e
    }
    try {
        let sq = document.getElementById(`${start_x-1}-${start_y+1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }  
    } catch(e){
        let x = e
    }
    try {
        let sq = document.getElementById(`${start_x-1}-${start_y}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }  
    } catch(e){
        let x = e
    }
    try {
        let sq = document.getElementById(`${start_x-1}-${start_y-1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }  
    } catch(e){
        let x = e
    }
    return moves
}

function get_column(start_x, start_y, color){
    const moves = []
    up_start = start_y + 1
    down_start = start_y - 1
    let enemy = color=='white' ? 'black' : 'white'
    while(up_start < 8){
        let sq = document.getElementById(`${start_x}-${up_start}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
            break;
        } else if(sq.classList.contains(data.color)){
            break;
        } else {
            moves.push(sq)
        }        
        up_start++
    }
    while(down_start >=0 ){
        let sq = document.getElementById(`${start_x}-${down_start}`)

        if(sq.classList.contains(enemy)){
            moves.push(sq)
            break;
        } else if(sq.classList.contains(data.color)){
            break;
        } else {
            moves.push(sq)
        }        
        down_start--
    }
    return moves
}

function get_diagonal(start_x, start_y, x,y, color){
    const moves = []
    start_x += x;
    start_y += y;
    let enemy = color=='white' ? 'black' : 'white'
    let upper_x_bound = x == -1 ? -1 : 8
    let upper_y_bound = y == -1 ? -1 : 8

    if(upper_x_bound==8 && upper_y_bound==8){
        while(start_x< upper_x_bound && start_y<upper_y_bound){
            let sq = document.getElementById(`${start_x}-${start_y}`)
            if(sq.classList.contains(enemy)){
                moves.push(sq)
                break;
            } else if(sq.classList.contains(data.color)){
                break;
            } else {
                moves.push(sq)
            }
            start_x+=x
            start_y+=y
        }
    } else if (upper_x_bound==-1 && upper_y_bound==8){
        while(start_x > upper_x_bound && start_y<upper_y_bound){
            let sq = document.getElementById(`${start_x}-${start_y}`)
            if(sq.classList.contains(enemy)){
                moves.push(sq)
                break;
            } else if(sq.classList.contains(data.color)){
                break;
            } else {
                moves.push(sq)
            }
            start_x+=x
            start_y+=y
        }
    } else if (upper_x_bound==-1 && upper_y_bound==-1){
        while(start_x > upper_x_bound && start_y > upper_y_bound){
            let sq = document.getElementById(`${start_x}-${start_y}`)
            if(sq.classList.contains(enemy)){
                moves.push(sq)
                break;
            } else if(sq.classList.contains(data.color)){
                break;
            } else {
                moves.push(sq)
            }
            start_x+=x
            start_y+=y
        }
    } else if (upper_x_bound==8 && upper_y_bound==-1){
        while(start_x < upper_x_bound && start_y > upper_y_bound){
            let sq = document.getElementById(`${start_x}-${start_y}`)
            if(sq.classList.contains(enemy)){
                moves.push(sq)
                break;
            } else if(sq.classList.contains(data.color)){
                break;
            } else {
                moves.push(sq)
            }
            start_x+=x
            start_y+=y
        }
    }
    
    return moves
}

function get_knight_moves(start_x, start_y, color){
    const moves = []  
    let enemy = color=='white' ? 'black' : 'white'
    try{
        let sq = document.getElementById(`${start_x-1}-${start_y+2}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }   
    } catch(e){
        let x = e
    }
    try{
        let sq = document.getElementById(`${start_x+1}-${start_y+2}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }   
    } catch(e){
        let x = e
    }
    try{
        let sq = document.getElementById(`${start_x-1}-${start_y-2}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }   
    } catch(e){
        let x = e
    }
    try{
        let sq = document.getElementById(`${start_x+1}-${start_y-2}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }   
    } catch(e){
        let x = e
    }
    try{
        let sq = document.getElementById(`${start_x-2}-${start_y+1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }   
    } catch(e){
        let x = e
    }
    try{
        let sq = document.getElementById(`${start_x-2}-${start_y-1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }   
    } catch(e){
        let x = e
    }
    try{
        let sq = document.getElementById(`${start_x+2}-${start_y+1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }   
    } catch(e){
        let x = e
    }
    try{
        let sq = document.getElementById(`${start_x+2}-${start_y-1}`)
        if(sq.classList.contains(enemy)){
            moves.push(sq)
        } else if(sq.classList.contains(data.color)){
        } else {
            moves.push(sq)
        }   
    } catch(e){
        let x = e
    }
    return moves
}

function paint_moves(moves){
    if(active_piece.piece == 'pawn'){
        for(move of moves){
            let data = get_square_data(move)
            if(data.x == active_piece.x && !move.classList.contains(active_piece.enemy)){
                move.classList.add('move')
            } else if(data.x != active_piece.x && move.classList.contains(active_piece.enemy)){
                move.classList.add('capture')
            }
        }
    } else {
        for(move of moves){
            if(target_has_piece(move) && move.classList.contains(active_piece.enemy)){
                move.classList.add('capture')
            } else {
                move.classList.add('move')
            }
        }
    }

}

function get_FEN_notation(){
    let x = 0
    let rows = []

    for(let y=7;y>=0;y--){
        let row = ''
        let blanks = 0

        for(let x=0;x<8;x++){
            
            let square = get_square(x,y,0,0)
            let data = get_square_data(square)
            let piece = ''

            if(data.piece == 'pawn'){
                piece = 'p'
            } else if(data.piece == 'knight'){
                piece = 'n'
            } else if(data.piece == 'bishop'){
                piece = 'b'
            } else if(data.piece == 'rook'){
                piece = 'r'
            } else if(data.piece == 'queen'){
                piece = 'q'
            } else if(data.piece == 'king'){
                piece = 'k'
            }
            if(data.color == 'white'){
                piece = piece.toUpperCase()
            }

            if(piece == ''){
                blanks++
                if(x==7){
                    row+=blanks
                    if(y!=0){
                        row+='/'
                    }
                }
            } else {
                if(blanks>0){
                    row += blanks;
                    blanks = 0;
                    row+=piece
                    if(x==7 && y!=0){
                        row+='/'
                    }
                } else {
                    row += piece
                    if (x==7 && y!=0){
                        row += '/'
                    }
                }
            }
        }  
        rows.push(row)
    }

    if(turn == 'white'){
        rows.push(' w')
    } else {
        rows.push(' b')
    }
    
    const castling = []
    if(_white_can_castle_king){
        castling.push('K')
    }
    if(_white_can_castle_queen){

        castling.push('Q')
    } 
    if(_black_can_castle_king){
        castling.push('k')
    }
    if(_black_can_castle_queen){
        castling.push('q')
    } 
    if(castling.length==0) {
        castling.push('-')
    }
    castling.unshift(' ')
    

    rows.push(castling.join(''))
    rows.push(' -')
    rows.push(' 0')
    rows.push(' ' + turns)


    return rows.join('')

}

function check_if_enemy_is_in_checkmate(res){
    if(res.status=='checkmate'){
        return true
    } else {
        return false
    }
}

function has_valid_move(res){
    if(res.status=='unknown'){
        return false
    } else {
        return true
    }
}

function is_move_checkmate(move){
    return move['san'].slice(-1) == '#' ? true : false
}

async function get_move(){
    let notation = get_FEN_notation()
    let res = await fetch('https://chessdb.cn/cdb.php?action=queryall&board=' + notation + '&json=1')
    res = await res.json()
    
    enemy_checkmate = check_if_enemy_is_in_checkmate(res)
    if(enemy_checkmate){return ['ENEMY CHECKMATE']}

    if(has_valid_move(res)){
        console.log('has_valid_move')

        let all_potential_moves = res.moves
        let move_max = all_potential_moves.length > max ? max : all_potential_moves.length
        let roll = Math.floor(Math.random()*(move_max))
        let chosen_move = all_potential_moves[roll]
        let is_checkmate = is_move_checkmate(chosen_move)
        return [chosen_move['uci'], is_checkmate]

    } else {

        let res_for_queue = await fetch('https://chessdb.cn/cdb.php?action=queue&board=' + notation + '&json=1')
        res = await res_for_queue.json()     
    }

    //timeout function for waiting for result
    const timeout = (ms) =>{
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let unknown = true
    document.getElementById('message').innerText = 'Thinking...'
    document.querySelector('#message').classList.add('blink')

    while (unknown){
        await timeout(5000)
        res = await fetch(
            'https://chessdb.cn/cdb.php?action=queryall&board=' + notation + '&json=1')
        res = await res.json()  
        if(res.status == 'unknown'){
            continue
        } else {
            
            unknown = false
            document.getElementById('message').innerText = ''
            let all_potential_moves = res.moves
            let move_max = all_potential_moves.length > max ? max : all_potential_moves.length
            let roll = Math.floor(Math.random()*(move_max))
            let chosen_move = all_potential_moves[roll]
            let is_checkmate = is_move_checkmate(chosen_move)
            return [chosen_move['uci'], is_checkmate]

        }
    }

}
