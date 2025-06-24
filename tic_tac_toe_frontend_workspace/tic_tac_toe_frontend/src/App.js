import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color palette and theme variables, matching requirements:
 * primary:   #1976d2
 * secondary: #90caf9
 * accent:    #388e3c
 * Uses light theme as default.
 */

/**
 * PUBLIC_INTERFACE
 * The main App component for the Tic Tac Toe web application.
 * Handles board state, game logic, player turns, winner/draw display, restart, and responsive layout.
 */
function App() {
  // Board is a flat array of 9 null/'X'/'O'
  const [board, setBoard] = useState(Array(9).fill(null));
  // 'X' starts first.
  const [xIsNext, setXIsNext] = useState(true);
  // 'X' | 'O' | 'draw' | null
  const [winner, setWinner] = useState(null);
  // Scores
  const [scores, setScores] = useState({ X: 0, O: 0 });
  // For game restart animation - triggers board highlight, then clears
  const [justFinished, setJustFinished] = useState(false);

  // Calculate winner whenever board changes
  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      setWinner(result);
      setJustFinished(true);

      // Increment scores
      if (result === "X" || result === "O") {
        setScores((prev) => ({
          ...prev,
          [result]: prev[result] + 1,
        }));
      }
    } else if (board.every((cell) => cell)) {
      setWinner("draw");
      setJustFinished(true);
    }
  }, [board]);

  // Clear justFinished flag after short highlight
  useEffect(() => {
    if (justFinished) {
      const timer = setTimeout(() => setJustFinished(false), 900);
      return () => clearTimeout(timer);
    }
  }, [justFinished]);

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (board[idx] || winner) return; // Already filled or game over
    const nextBoard = board.slice();
    nextBoard[idx] = xIsNext ? "X" : "O";
    setBoard(nextBoard);
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXIsNext(true);
    setJustFinished(false);
  }

  // Styling: Theming via CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    // Light theme, overrides template's root variables
    root.style.setProperty("--team-x", "#1976d2");
    root.style.setProperty("--team-o", "#388e3c");
    root.style.setProperty("--accent", "#90caf9");
    root.style.setProperty("--grid-bg", "#ffffff");
    root.style.setProperty("--grid-border", "#1976d2");
    root.style.setProperty("--winner-bg", "#e3f2fd");
    root.style.setProperty("--draw-bg", "#f5f5f5");
    root.style.setProperty("--score-bg", "#f1f8e9");
    root.style.setProperty("--min-board-size", "270px");
    root.style.setProperty("--max-board-size", "410px");
  }, []);

  // Build status banner
  let statusMsg;
  if (winner === "X") statusMsg = "Player X wins!";
  else if (winner === "O") statusMsg = "Player O wins!";
  else if (winner === "draw") statusMsg = "It's a draw!";
  else statusMsg = `Turn: Player ${xIsNext ? "X" : "O"}`;

  // Show winning line highlight if winner
  const winLine = winner && winner !== "draw" ? findWinLine(board, winner) : null;

  // UI Layout: Centered grid, controls above, score left/top on mobile, responsive
  return (
    <div className="ttt-app-wrapper">
      <div className="ttt-panel">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <div
          className={
            "ttt-status" +
            (winner === "X"
              ? " x-win"
              : winner === "O"
              ? " o-win"
              : winner === "draw"
              ? " draw"
              : "")
          }
        >
          {statusMsg}
        </div>
        <button
          className="ttt-restart-btn"
          onClick={handleRestart}
          aria-label="Restart the game"
        >
          &#x21bb; Restart
        </button>
        <div className="ttt-scoreboard">
          <Score
            label="Player X"
            value={scores.X}
            active={xIsNext && !winner}
            color="var(--team-x)"
            highlight={winner === "X"}
          />
          <Score
            label="Player O"
            value={scores.O}
            active={!xIsNext && !winner}
            color="var(--team-o)"
            highlight={winner === "O"}
          />
        </div>
      </div>
      <Board
        squares={board}
        onClick={handleSquareClick}
        winLine={winLine}
        winner={winner}
        justFinished={justFinished}
      />
      <footer className="ttt-footer">
        <span className="ttt-credit">
          Modern minimalist React game &mdash; <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a>
        </span>
      </footer>
    </div>
  );
}

// Helper: checks board for winner, returns "X", "O", "draw", or null
function calculateWinner(sq) {
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
  for (let line of lines) {
    const [a, b, c] = line;
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
  }
  return null;
}

// Helper: locate the win line to highlight
function findWinLine(sq, winnerMark) {
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
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      sq[a] === winnerMark &&
      sq[b] === winnerMark &&
      sq[c] === winnerMark
    )
      return line;
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * The Score component for showing player scores.
 */
function Score({ label, value, active, color, highlight }) {
  return (
    <div
      className={
        "ttt-score" + (active ? " active" : "") + (highlight ? " highlight" : "")
      }
      style={{
        borderColor: color,
        color,
        background: highlight
          ? "var(--winner-bg)"
          : active
          ? "var(--score-bg)"
          : "transparent",
      }}
    >
      <div className="ttt-score-label">{label}</div>
      <div className="ttt-score-value">{value}</div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * The main Board component: a 3x3 responsive tic tac toe grid.
 */
function Board({ squares, onClick, winLine, winner, justFinished }) {
  // Highlight squares that are in the winLine, if any
  return (
    <div className="ttt-board-container">
      <div
        className={
          "ttt-board" +
          (winner && justFinished
            ? winner === "draw"
              ? " board-draw"
              : winner === "X"
              ? " board-x-win"
              : " board-o-win"
            : "")
        }
        style={{
          minWidth: "var(--min-board-size)",
          minHeight: "var(--min-board-size)",
          maxWidth: "var(--max-board-size)",
          maxHeight: "var(--max-board-size)",
        }}
      >
        {squares.map((val, idx) => (
          <Square
            key={idx}
            value={val}
            onClick={() => onClick(idx)}
            highlight={winLine && winLine.includes(idx)}
            disabled={Boolean(winner) || Boolean(val)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * A single board cell (Square) component.
 */
function Square({ value, onClick, highlight, disabled }) {
  // symbol colors
  let symbolColor =
    value === "X"
      ? "var(--team-x)"
      : value === "O"
      ? "var(--team-o)"
      : undefined;

  return (
    <button
      className={
        "ttt-square" +
        (value ? " filled" : "") +
        (highlight ? " highlight" : "")
      }
      onClick={onClick}
      disabled={disabled}
      style={{
        color: symbolColor,
        borderColor: highlight ? "var(--accent)" : "var(--grid-border)",
        background: highlight ? "var(--winner-bg)" : undefined,
        cursor: disabled ? "default" : "pointer",
      }}
      aria-label={
        value
          ? `Cell filled with ${value}`
          : "Empty tic tac toe cell"
      }
    >
      {value || ""}
    </button>
  );
}

export default App;
