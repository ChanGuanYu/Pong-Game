import { interval, fromEvent} from 'rxjs'
import { map, filter} from 'rxjs/operators'

function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code! 

    const canvas = document.getElementById("canvas")

    // Position of the paddles
    const paddlePlayerPosX = 550
    const paddleAIPosX = 40
    const paddlePosY = 260

    // Speed in which the ball travels
    const ballSpeed = 3

    // Tick which is the value for interval in ms
    const tick = 10

    // Velocity of ball, which can either be 1 or -1
    const ballVelocity = {x: 1, y: 1}

    // Change the direction of the ball's velocity
    const changeDirection = -1

    // Scores the AI and player
    const scores = {player: 0, ai: 0}

    // Winning score
    const winningScore = 7

    // State of the game, starts with false
    const game = {end: false}

    // Runs the game, while game has not ended yet
    // If game.end is true, game ends, else it keeps going on
    const pongObs = interval(tick).pipe(
      filter(() => game.end !== true)
    )

    // Element for restarting the game by clicking on the text "Restart Game"
    const restart = document.createElementNS(canvas.namespaceURI, "text")
    Object.entries({x: 95, y: 500, fill: "white"})
    .forEach(([key, val]) => restart.setAttribute(key, String(val)))

    restart.textContent = "Restart Game"
    canvas.appendChild(restart)
    restart.setAttribute("font-size", "0px")

    // Only occurs when game has ended, restarts the game by changing game.end to false
    // Reset the values to the original values
    const restartClick = fromEvent<MouseEvent>(restart, "click").pipe(
      filter(({}) => game.end !== false)
    )
    restartClick.subscribe((_) => {
      paddlePlayer.setAttribute("y", String(paddlePosY))
      paddleAI.setAttribute("y", String(paddlePosY))
      ball.setAttribute("cx", String(300))
      ball.setAttribute("cy", String(255))
      scoreAI.textContent = "0"
      scorePlayer.textContent = "0"
      restart.setAttribute("font-size", "0px")
      canvas.removeChild(gameOver)
      game.end = false
    })

    // Create a display for the winner, which is either AI or player
    const gameOver = document.createElementNS(canvas.namespaceURI, "text")
    Object.entries({x: 115, y: 200, fill: "white"})
    .forEach(([key, val]) => gameOver.setAttribute(key, String(val)))
    gameOver.setAttribute("font-size", "48px")

    // Create AI score to be displayed
    const scoreAI = document.createElementNS(canvas.namespaceURI, "text")
    Object.entries({x: 150, y: 75, fill: "white"})
    .forEach(([key, val]) => scoreAI.setAttribute(key, String(val)))

    scoreAI.setAttribute("font-size", "60px")
    scoreAI.textContent = "0"
    canvas.appendChild(scoreAI)

    // Create player score to be displayed
    const scorePlayer = document.createElementNS(canvas.namespaceURI, "text")
    Object.entries({x: 450, y: 75, fill: "white"})
    .forEach(([key, val]) => scorePlayer.setAttribute(key, String(val)))

    scorePlayer.setAttribute("font-size", "60px")
    scorePlayer.textContent = "0"
    canvas.appendChild(scorePlayer)

    // Create pong ball
    const ball = document.createElementNS(canvas.namespaceURI, "circle")
    Object.entries({cx: 300, cy: 255, r: 5, fill: "white"})
    .forEach(([key, val]) => ball.setAttribute(key, String(val)))
    canvas.appendChild(ball)

    // Create middle dashed line
    const dashedLine = document.createElementNS(canvas.namespaceURI, "line")
    Object.entries({x1: 300, x2: 300, y1: 5, y2: 600, stroke: "white"})
    .forEach(([key, val]) => dashedLine.setAttribute(key, String(val)))

    dashedLine.setAttribute("stroke-width", "5")
    dashedLine.setAttribute("stroke-dasharray", "10")
    canvas.appendChild(dashedLine)

    // Create AI paddle
    const paddleAI = document.createElementNS(canvas.namespaceURI, "rect")
    Object.entries({x: paddleAIPosX, y: paddlePosY, width: 10, height: 80, fill: "white"})
    .forEach(([key, val]) => paddleAI.setAttribute(key, String(val)))
    canvas.appendChild(paddleAI)

    // Create player paddle
    const paddlePlayer = document.createElementNS(canvas.namespaceURI, "rect")
    Object.entries({x: paddlePlayerPosX, y: paddlePosY, width: 10, height: 80, fill: "white"})
    .forEach(([key, val]) => paddlePlayer.setAttribute(key, String(val)))
    canvas.appendChild(paddlePlayer)

    // Allows player to control paddle using mouse
    const mouse = fromEvent<MouseEvent>(canvas, "mousemove")
    mouse.pipe(
      // Prevents the paddle from going beyond the canvas
      // Paddle is only movable if the game has not ended
      filter(({y}) => y < 600),
      filter(() => game.end !== true),
      map(({offsetY}) => ({y: offsetY}))
    ).subscribe(({y}) => {paddlePlayer.setAttribute("y", String(y))})

    // For the ball to move around, with a constant speed and changing velocity
    pongObs.subscribe(() => 
    {
      ball.setAttribute("cx", String((ballSpeed * ballVelocity.x) + Number(ball.getAttribute("cx"))))
      ball.setAttribute("cy", String((ballSpeed * ballVelocity.y) + Number(ball.getAttribute("cy"))))
    })
    
    // When ball collides with ceiling or floor of canvas
    // The velocity of y changes, which allows it to bounce of the ceiling or floor
    // The conditions are to check for the ball collision
    pongObs.pipe(
      map(() => ({ballCX: Number(ball.getAttribute("cx")), 
                  ballCY: Number(ball.getAttribute("cy")), 
                  ballR: Number(ball.getAttribute("r"))})),
      filter(({ballCX, ballCY, ballR}) => 
              (ballCX - ballR > 0 || ballCX + ballR < 600) && 
              (ballCY - ballR <= 0 || ballCY + ballR >= 600))
    ).subscribe(() => {ballVelocity.y = ballVelocity.y * changeDirection})
  
    // Movement for AI paddle
    // AI tracks the movement of the ball and follows it
    // Filter conditions are to ensure that the AI paddle does not follow the ball
    // Where it causes the paddle to go beyond the canvas
    // The if and else statements are to determine the speed of the paddle
    // If it is closer to the paddle, moves slower, else it speeds up
    pongObs.pipe(
      map(() => ({ballCY: Number(ball.getAttribute("cy")),
                  aiHeight: Number(paddleAI.getAttribute("height")),
                  aiY: Number(paddleAI.getAttribute("y"))})),
      filter(({ballCY, aiHeight}) => ballCY <= 520 - aiHeight/2 && ballCY >= 0 + aiHeight/2)
    ).subscribe(({ballCY, aiY, aiHeight}) => 
    {
      // If the absolute difference is more than 200, increase the speed
      if (Math.abs(ballCY - aiY) > 200)
      {
        paddleAI.setAttribute("y", String((ballCY - aiHeight/2) * 1.8))
      }
      // If the absolute difference is less than 200, increase the speed by a little
      else if (Math.abs(ballCY - aiY) < 200)
      {
        paddleAI.setAttribute("y", String((ballCY - aiHeight/2) * 1.2))
      }
      else
      // Else maintain the speed
      {
        paddleAI.setAttribute("y", String((ballCY - aiHeight/2)))
      }
    })
    
    // To check when the ball collides with the player's paddle
    // The velocity of x changes to ensure that the ball bounces, going in the opposite direction
    pongObs.pipe(
      map(() => ({playerX: Number(paddlePlayer.getAttribute("x")),
                  playerY: Number(paddlePlayer.getAttribute("y")), 
                  playerHeight: Number(paddlePlayer.getAttribute("height")),
                  ballCX: Number(ball.getAttribute("cx")), 
                  ballCY: Number(ball.getAttribute("cy")), 
                  ballR: Number(ball.getAttribute("r"))
                })),
      filter(({ballCX, ballCY, ballR, playerX, playerY, playerHeight}) => ballCX + ballR >= playerX &&
      (ballCY - ballR <= playerY + playerHeight && ballCY + ballR >= playerY))
    ).subscribe(() => {ballVelocity.x = -1})
    
    // To check when the ball collides with the AI's paddle
    // The velocity of x changes to ensure that the ball bounces, going in the opposite direction 
    pongObs.pipe(
      map(() => ({aiX: Number(paddleAI.getAttribute("x")),
                aiY: Number(paddleAI.getAttribute("y")), 
                aiHeight: Number(paddleAI.getAttribute("height")),
                ballCX: Number(ball.getAttribute("cx")), 
                ballCY: Number(ball.getAttribute("cy")), 
                ballR: Number(ball.getAttribute("r"))
              })),
      filter(({ballCX, ballCY, ballR, aiX, aiY, aiHeight}) => ballCX - ballR <= aiX &&
      (ballCY - ballR <= aiY + aiHeight && ballCY + ballR >= aiY))
    ).subscribe(() => {ballVelocity.x = 1})

    // If player scores, ball moves towards AI paddle
    // If the ball is past the canvas, place the ball back into its original position
    // The velocity of x changes to allow ball to head towards AI's side
    // Increase the score of player and updates the display
    pongObs.pipe(
      map(() => ({ballCX: Number(ball.getAttribute("cx")), 
                  ballCY: Number(ball.getAttribute("cy")), 
                  ballR: Number(ball.getAttribute("r"))})), 
      filter(({ballCX, ballR}) => (ballCX + ballR <= -10))
    ).subscribe(({ballCX, ballR}) => 
    {
      // -10 to ensure that the ball is out of bounds
      if (ballCX + ballR < -10)
      {
        Object.entries({cx: 300, cy: 255})
        .forEach(([key, val]) => ball.setAttribute(key, String(val)))
        ballVelocity.x = -1
        scores.player = scores.player + 1
        scorePlayer.textContent = String(scores.player)
      }
    })

    // If AI scores, ball moves towards player paddle
    // If the ball is past the canvas, place the ball back into its original position
    // The velocity of x changes to allow ball to head towards player's side
    // Increase the score of AI and updates the display
    pongObs.pipe(
      map(() => ({ballCX: Number(ball.getAttribute("cx")), 
                  ballCY: Number(ball.getAttribute("cy")), 
                  ballR: Number(ball.getAttribute("r"))})), 
      filter(({ballCX, ballR}) => (ballCX + ballR >= 610))
    ).subscribe(({ballCX, ballR}) => 
    {
      // 610 to ensure that the ball is out of bounds
      if (ballCX + ballR >= 610)
      {
        Object.entries({cx: 300, cy: 255})
        .forEach(([key, val]) => ball.setAttribute(key, String(val)))
        ballVelocity.x = 1
        scores.ai = scores.ai + 1
        scoreAI.textContent = String(scores.ai)
      }
    })

    // This function handles the restarting of the game
    // After a winner is determined
    function restartGame(winner: String)
    {
      // Reset the paddles back to original position
      Object.entries({x: paddleAIPosX, y: paddlePosY})
      .forEach(([key, val]) => paddleAI.setAttribute(key, String(val)))
      Object.entries({x: paddlePlayerPosX, y: paddlePosY})
      .forEach(([key, val]) => paddlePlayer.setAttribute(key, String(val)))
      // Reset the scores to 0
      scores.ai = 0
      scores.player = 0
      // Game has ended, therefore game.end is true
      game.end = true
      // Depending on who is the winner, displays the winner
      // Displays the "Restart Game" text for the game to be restarted
      if (winner === "ai")
      {
        const winnerAI = "AI is the winner!"
        gameOver.textContent = winnerAI
        canvas.appendChild(gameOver)
        restart.setAttribute("font-size", "60px")
      }
      else if (winner === "player")
      {
        const winnerPlayer = "Player is the winner!"
        gameOver.textContent = winnerPlayer
        canvas.appendChild(gameOver)
        restart.setAttribute("font-size", "60px")
      }
    }

    // Either side that reaches a score of 7, wins
    // restartGame is called
    pongObs.pipe(
      map(() => ({ai: scores.ai, player: scores.player}))
    ).subscribe(({ai, player}) => 
    {
      if (ai == winningScore)
      {
        restartGame("ai")
      }
      else if (player == winningScore)
      {
        restartGame("player")
      }
    })
}

// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = () => {
    pong();
  }
  
  

