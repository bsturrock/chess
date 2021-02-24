
class Board():

    def __init__(self):
        self.turn = 'white'
        self.direction = 1
        self.front = 8
        self.back = 1
        self.left = 1
        self.right = 8
        self.squares = []
        for i in range(1,9):
            for j in range(1,9):
                self.squares.append(Square(i,j))

    def change(self):
        if self.turn == 'white':
            self.turn = 'black'
            self.direction = -1
            self.front = 1
            self.back = 8
            self.left = 8
            self.right = 1

        elif self.turn == 'black':
            self.turn = 'white'
            self.direction = 1
            self.front = 8
            self.back = 1
            self.left = 1
            self.right = 8

    def getrow(self, row):
        my_row = [x for x in self.squares if x.row == row]
        return my_row

    def getcolumn(self, column):
        my_column = [x for x in self.squares if x.column == column]
        return my_column

    def sq(self, row, column):
        my_sq = [x for x in self.squares if x.row == row and x.column == column]
        if len(my_sq):
            return my_sq[0]
        else:
            return None

    def clrsq(self, row, column):
        my_sq = self.sq(row,column)
        my_sq.contains = None

    def moves(self, row, column):
        my_sq = self.sq(row,column)
        possible_moves = []
        if not my_sq.contains:
            return False
        else:
            if my_sq.contains.color != self.turn:
                return False
            else:
                if my_sq.contains.piece_type == 0:
                    front = self.in_front(row, column)
                    if front:
                        if not front.contains:
                            possible_moves.append(front)
                        if my_sq.contains.first_move:
                            two_front = self.two_in_front(row, column)
                            if not front.contains and not two_front.contains:
                                possible_moves.append(two_front)
        return possible_moves

    def move(self, row, column, target_row, target_column):
        my_sq = self.sq(row,column)
        possible_moves = self.moves(row, column)

        if not possible_moves:
            return 'no possible moves'
        else:
            for x in possible_moves:
                if x.row ==target_row and x.column == target_column:
                    piece = my_sq.contains
                    piece.first_move = False
                    my_sq.contains = None
                    new_sq = self.sq(target_row,target_column)
                    new_sq.contains = piece
                    return 'successful move'
            return 'not a valid move'



    def in_front(self, row, column):
        if row == self.front:
            return None
        my_sq = self.sq(row, column)
        if not my_sq.row == self.front:
            return self.sq(row + self.direction, column)

    def two_in_front(self, row, column):
        my_sq = self.sq(row, column)
        if not my_sq.row > self.front - 1:
            return self.sq(row + (self.direction * 2), column)        

    def clear(self):
        for x in self.squares:
            x.contains = None

    def fill(self, row, column, piece):
        my_sq = self.sq(row, column)
        my_sq.contains = piece

    def gen(self, row, column, piece_type, piece_color):
        my_sq = self.sq(row,column)
        my_sq.contains = Piece(piece_type, piece_color)

    def display(self):
        for i in range(8,0,-1):
            print(self.getrow(i))

    def graph(self):
        for i in range(8,0,-1):
            print([x.as_sq() for x in self.squares if x.row == i])

    def mark_row(self, row):
        my_row = self.getrow(row)
        for x in my_row:
            x.contains = 'X'
        self.graph()
        for x in my_row:
            x.contains = " "

    def mark_col(self, column):
        my_col = self.getcolumn(column)
        for x in my_col:
            x.contains = 'X'
        self.graph()
        for x in my_col:
            x.contains = " "



class Square():

    def __init__(self, row, column):
        self.row = row
        self.column = column
        self.contains = None

    def __repr__(self):
        return "[" + str(self.row) + "," + str(self.column) + "]"

    def as_sq(self):
        if self.contains:
            return "[" + self.contains.icon + "]"
        else:
            return "[ ]"


class Piece():

    colors = {
        0 : 'white',
        1 : 'black'
    }

    piece_dict = {
        0 : ['pawn', 'p', 1],
        1 : ['bishop', 'b', 3],
        2 : ['knight', 'k', 3],
        3 : ['rook', 'r', 4],
        4 : ['queen', 'q', 5],
        5 : ['king', 'k', 1]
    }

    def __init__(self, piece_type, piece_color):
        self.piece_type = piece_type
        self.piece_color = piece_color
        self.color = self.colors[self.piece_color]
        self.name = self.piece_dict[self.piece_type][0]
        self.icon = self.piece_dict[self.piece_type][1]
        self.value = self.piece_dict[self.piece_type][2]
        self.first_move = True
