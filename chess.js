

const clicked_piece = {
    x: 0,
    y: 0,
    piece: null,
    color: null,
    enemy: null
}

function update_clicked_piece(data){
    clicked_piece.x = data.x
    clicked_piece.y = data.y
    clicked_piece.piece = data.piece
    clicked_piece.color = data.color   
    clicked_piece.enemy = data.enemy 
}

function unclick_piece(){
    clicked_piece.x = 0
    clicked_piece.y = 0
    clicked_piece.piece = null
    clicked_piece.color = null  
}

function move_clicked_piece(target){
    target.classList.add(clicked_piece.piece)
    target.classList.add(clicked_piece.color)
    document.getElementById(`${clicked_piece.x}-${clicked_piece.y}`).classList.remove(clicked_piece.piece)
    document.getElementById(`${clicked_piece.x}-${clicked_piece.y}`).classList.remove(clicked_piece.color)

    if(clicked_piece.piece == 'king' && target == get_square(clicked_piece.x, clicked_piece.y,2,0)){ //check for castle
        let rook = get_square(7,0,0,0)
        let new_rook = get_square(5,0,0,0)
        rook.classList.remove('rook')
        rook.classList.remove(clicked_piece.color)
        new_rook.classList.add('rook')
        new_rook.classList.add(clicked_piece.color)
    }

}

function unmove_piece(target){
    target.classList.remove(clicked_piece.piece)
    target.classList.remove(clicked_piece.color)
    document.getElementById(`${clicked_piece.x}-${clicked_piece.y}`).classList.add(clicked_piece.piece)
    document.getElementById(`${clicked_piece.x}-${clicked_piece.y}`).classList.add(clicked_piece.color)  
    
    if(clicked_piece.piece == 'king' && target == get_square(clicked_piece.x, clicked_piece.y,2,0)){ //check for castle
        let rook = get_square(7,0,0,0)
        let new_rook = get_square(5,0,0,0)
        rook.classList.add('rook')
        rook.classList.add(clicked_piece.color)
        new_rook.classList.remove('rook')
        new_rook.classList.remove(clicked_piece.color)
    }
}

function capture(target){
    target.classList.remove('rook')
    target.classList.remove('knight')
    target.classList.remove('queen')
    target.classList.remove('bishop')
    target.classList.remove('pawn')
    target.classList.remove(clicked_piece.enemy)
    target.classList.add(clicked_piece.piece)    
    target.classList.add(clicked_piece.color)
    document.getElementById(`${clicked_piece.x}-${clicked_piece.y}`).classList.remove(clicked_piece.piece)
    document.getElementById(`${clicked_piece.x}-${clicked_piece.y}`).classList.remove(clicked_piece.color)
}

function square_click(target){

    data = square_data(target) //returns false or object with piece data
    if(target.classList.contains('attack')){
        capture(target);
        clear_moves_from_board()
        if(is_in_check('black') && clicked_piece.color == 'black'){
            unmove_piece(target)
        }
        if(is_in_check('white') && clicked_piece.color == 'white'){
            unmove_piece(target)
        }
        return
    }
    if(target.classList.contains('move')){ // clicking to move a piece
        move_clicked_piece(target)
        clear_moves_from_board()
        if(is_in_check('black')){
            unmove_piece(target)
        }

    } else {
        if(!data){ // if no piece clicked return false
            unclick_piece()
            clear_moves_from_board()
            return false
        }
        //if clicked on already clicked piece
        if(data.x == clicked_piece.x && data.y == clicked_piece.y && data.piece == clicked_piece.piece && data.color == clicked_piece.color){
            unclick_piece()
            clear_moves_from_board()
            return false
        }

        //Otherwise
        update_clicked_piece(data) //make clicked piece the active_piece
        clear_moves_from_board() //remove all previous moves from board

        let base_moves = get_base_possible_moves(data)

        for(let move of base_moves){
            if(move.classList.contains(clicked_piece.enemy) && !move.classList.contains('king')){
                move.classList.add('attack')
            } else if(!move.classList.contains('king')){
                move.classList.add('move')
            } else if(move.classList.contains('king') && move.classList.contains(clicked_piece.enemy)){
                move.classList.add('check')
            }
        }
   
    }

}

function clear_moves_from_board(){
    squares = document.querySelectorAll('.row')
    for(square of squares){
        if(square.classList.contains('move')){
            square.classList.remove('move')
        }
        if(square.classList.contains('attack')){
            square.classList.remove('attack')
        }        
        if(square.classList.contains('check')){
            square.classList.remove('check')
        }     
    } 
}

function get_base_possible_moves(data){
    const moves = []
    const enemy = data.color=='white' ? 'black' : 'white'

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
        let castleable = can_castle(data.x, data.y, data.color)
        if(castleable){
            moves.push(get_square(data.x,data.y,2,0))
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

function can_castle(start_x, start_y, color){
    if(start_x != 4 || start_y != 0){ return false }
    if(get_square(start_x, start_y, 1, 0).classList.contains('white')){return false}
    if(get_square(start_x, start_y, 1, 0).classList.contains('black')){return false}
    if(get_square(start_x, start_y, 2, 0).classList.contains('white')){return false}
    if(get_square(start_x, start_y, 2, 0).classList.contains('black')){return false}
    if(!get_square(start_x, start_y, 3, 0).classList.contains('rook')){return false} 
    return true
}

function find_king(color){
    return document.querySelector(`.king.${color}`)
}

function is_in_check(color){

    let king = find_king(color)
    let enemy = color=='white' ? 'black' : 'white'
    let pawns = document.querySelectorAll(`.pawn.${enemy}`)

    let knights = document.querySelectorAll(`.knight.${enemy}`)

    let bishops = document.querySelectorAll(`.bishop.${enemy}`)

    let queen = document.querySelector(`.queen.${enemy}`)

    let rooks = document.querySelectorAll(`.rook.${enemy}`)


    all_moves = []
    for(knight of knights){
        let data = square_data(knight)
        let moves = get_base_possible_moves(data)
        all_moves.push(...moves)
    }
    for(bishop of bishops){
        let data = square_data(bishop)
        let moves = get_base_possible_moves(data)
        all_moves.push(...moves)
    }
    for(rook of rooks){
        let data = square_data(rook)
        let moves = get_base_possible_moves(data)
        all_moves.push(...moves)
    }
    if(queen){
        let data = square_data(queen)
        let moves = get_base_possible_moves(data)
        all_moves.push(...moves)
    }

    if(all_moves.includes(king)){
        console.log('CHECK!')
        return true
    } else {
        console.log('NOT CHECK')
        return false
    }


    
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

function get_square(start_x, start_y, x, y){
    try {
        return document.getElementById(`${start_x+x}-${start_y+y}`)
    } catch(e){
        return false
    }
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

function square_data(target){

    let x = parseInt(target.id[0])
    let y = parseInt(target.id.slice(-1))
    let color = get_color(target)

    if(!color){return false} // if not piece, return false

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
        return false // if not piece, return false
    }

    const data = {
        x: x,
        y: y,
        color: color,
        piece: piece,
        enemy: color=='white' ? 'black' : 'white'
    }
    return data
}

function get_color(target){
    if(target.classList.contains('white')){
        return 'white'
    } else if (target.classList.contains('black')){
        return 'black'
    } else {
        return false
    }
}