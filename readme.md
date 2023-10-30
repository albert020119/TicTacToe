TicTacToe web app

Architecture in assets folder

================================================================

Server:

WebSocket Server:  It should support multiple game rooms, allowing players to join and play against each other. / or invites

Game Logic: The server should manage the Tic Tac Toe game rules, including checking for win conditions and updating the game board's state.

Will probably write it in python. 

Player Management: Keep track of connected players, their game state, and match them with opponents.

React Native Client:

User Interface: Create a React Native app with a user interface for the game. Components for the game board, and game status display and maybe friends. 

WebSocket Client: Use a WebSocket client library for React Native to connect to the WebSocket server. This allows players to send and receive game moves and chat messages in real-time.

Game Logic Integration: The React Native app should communicate with the server to make moves, receive updates, and display the game board.

Player Authentication: Implement a simple authentication system to identify players and prevent unauthorized access to the game.

Game State Synchronization: Ensure that the game state is synchronized between players in real-time.

Win Condition Detection: Implement logic on the client side to detect win conditions and display the game result when a player wins.

Database (Optional):
If we want to keep a record of past games or maintain player profiles, we can use a database to store this information. We can choose a database (probably mongo or firebase)