import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import BluetoothReadEvent from 'react-native-bluetooth-classic';

const sleep = ms => new Promise(
  resolve => setTimeout(resolve, ms)
);

export function TicTacToe({ navigation, route }) {
  //console.log(route.params); 
  let device=null; let start=true;
  try {
    device = route.params.connected_device; 
    start = route.params.start; 
  } catch (e) {}

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);


  
  const reader = async () => {
    let message = null; 
    while (true) {
      await sleep(1000); 
      message = await device.read();
      if (message === null){
        continue
      }
      let new_board = []
      console.log(message)
      for (let i = 0; i < message.length; i++) {
        if (message[i] == 'N'){
          console.log("pushing null");
          new_board.push(null);
          continue
        }
        new_board.push(message[i]);
      }
      console.log("Setting new board");
      setBoard(new_board);
      const result = calculateWinner();
      if (result) {
        setWinner(result);
      }

    }
  }

  if (device){
    reader(); 
  }

  const calculateWinner = () => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }

    return null;
  };

  const handleSquarePress = async (index) => {
    if (board[index] || winner) {
      return;
    }

    const newBoard = board.slice();
    if (device){
      newBoard[index] = start ? 'X' : 'O';
    } else {
      newBoard[index] = isXNext ? 'X' : 'O';
    }
    setBoard(newBoard);
    if(device){
      let payload_string = "";
      for (let i = 0; i < newBoard.length; i++) {
          if (newBoard[i] == 'X') {
            payload_string = payload_string + 'X';
          }
          if (newBoard[i] == 'O') {
            payload_string = payload_string + 'O';
          } 
          if (newBoard[i] == null) {
            payload_string = payload_string + 'N';
          }
      }
      console.log("Sending payload: " + payload_string);
      await device.write(payload_string + '\n');
    } 

    setIsXNext(!isXNext);
  };

  useEffect(() => {
    const result = calculateWinner();
    if (result) {
      setWinner(result);
    }
  }, [board]); // Run the effect whenever the board changes

  const renderSquare = (index) => (
    <TouchableOpacity
      style={[styles.square, winner && winner.line.includes(index) && styles.winningSquare]}
      onPress={() => handleSquarePress(index)}
    >
      <Text style={[styles.squareText, winner && winner.line.includes(index) && styles.winningText]}>
        {board[index]}
      </Text>
    </TouchableOpacity>
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderWinnerMessage = () => {
    if (winner) {
      Alert.alert("", `${winner.winner} wins!`, [{ text: 'OK', onPress: resetGame }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      <View style={styles.board}>
        <View style={styles.row}>
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </View>
        <View style={styles.row}>
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </View>
        <View style={styles.row}>
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </View>
      </View>
      {renderWinnerMessage()}
      <TouchableOpacity style={styles.button} onPress={resetGame}>
        <Text style={styles.buttonText}>Reset Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    board: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 300, // Adjust as needed
      marginTop: 10,
    },
    square: {
      width: 100, // Adjust as needed
      height: 100, // Adjust as needed
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: '#333',
      borderWidth: 1,
    },
    squareText: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#2980b9',
      padding: 10,
      marginVertical: 10,
      borderRadius: 20,
      width: '80%',
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
    },
    winningSquare: {
        backgroundColor: 'yellow',
      },
    winningText: {
        color: 'red',
    },
  });
  

export default TicTacToe;
