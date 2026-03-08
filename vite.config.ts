import { useState, useEffect, useCallback, useRef } from 'react';
import SudokuGrid from './components/SudokuGrid';
import GameControls from './components/GameControls';
import NumberPad from './components/NumberPad';
import {
  generatePuzzle,
  cloneGrid,
  isComplete,
  validateGrid,
  SudokuGrid as GridType,
  Difficulty,
  gridToString,
  solveSudoku
} from './utils/sudoku';
import { supabase } from './lib/supabase';
import { Timer, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [initialGrid, setInitialGrid] = useState<GridType>(() => generatePuzzle(difficulty).puzzle);
  const [currentGrid, setCurrentGrid] = useState<GridType>(() => cloneGrid(initialGrid));
  const [solution, setSolution] = useState<GridType>(() => generatePuzzle(difficulty).solution);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSolving, setIsSolving] = useState(false);
  const [highlightedCell, setHighlightedCell] = useState<{ row: number; col: number } | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const timerRef = useRef<number>();
  const solvingRef = useRef(false);

  useEffect(() => {
    if (isActive && !isSolving) {
      timerRef.current = window.setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isSolving]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveGameSession = async (isCompleted = false, isSolvedAuto = false) => {
    try {
      const data = {
        difficulty,
        initial_puzzle: gridToString(initialGrid),
        current_state: gridToString(currentGrid),
        solution: gridToString(solution),
        time_elapsed: timer,
        is_completed: isCompleted,
        is_solved_auto: isSolvedAuto,
        completed_at: isCompleted ? new Date().toISOString() : null
      };

      if (sessionId) {
        await supabase
          .from('game_sessions')
          .update(data)
          .eq('id', sessionId);
      } else {
        const { data: newSession } = await supabase
          .from('game_sessions')
          .insert(data)
          .select()
          .single();
        if (newSession) {
          setSessionId(newSession.id);
        }
      }
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  };

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (sessionId || timer > 0) {
        saveGameSession();
      }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [sessionId, timer, currentGrid]);

  const handleNewGame = () => {
    const puzzle = generatePuzzle(difficulty);
    setInitialGrid(puzzle.puzzle);
    setCurrentGrid(cloneGrid(puzzle.puzzle));
    setSolution(puzzle.solution);
    setSelectedCell(null);
    setTimer(0);
    setIsActive(true);
    setIsSolving(false);
    setSessionId(null);
    showMessage('New game started!', 'info');
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    const puzzle = generatePuzzle(newDifficulty);
    setInitialGrid(puzzle.puzzle);
    setCurrentGrid(cloneGrid(puzzle.puzzle));
    setSolution(puzzle.solution);
    setSelectedCell(null);
    setTimer(0);
    setIsActive(true);
    setSessionId(null);
    showMessage(`Difficulty changed to ${newDifficulty}`, 'info');
  };

  const handleCellClick = (row: number, col: number) => {
    if (initialGrid[row][col] === null && !isSolving) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberSelect = (num: number | null) => {
    if (selectedCell && !isSolving) {
      const newGrid = cloneGrid(currentGrid);
      newGrid[selectedCell.row][selectedCell.col] = num;
      setCurrentGrid(newGrid);

      if (isComplete(newGrid)) {
        setIsActive(false);
        showMessage('Congratulations! Puzzle solved!', 'success');
        saveGameSession(true, false);
      }
    }
  };

  const handleCheck = () => {
    if (validateGrid(currentGrid)) {
      if (isComplete(currentGrid)) {
        showMessage('Perfect! Puzzle is complete and correct!', 'success');
        setIsActive(false);
        saveGameSession(true, false);
      } else {
        showMessage('Looking good so far! Keep going!', 'success');
      }
    } else {
      showMessage('There are some errors in your solution.', 'error');
    }
  };

  const handleReset = () => {
    setCurrentGrid(cloneGrid(initialGrid));
    setSelectedCell(null);
    setTimer(0);
    setIsActive(true);
    showMessage('Puzzle reset!', 'info');
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSolve = useCallback(async () => {
    if (isSolving) return;

    setIsSolving(true);
    solvingRef.current = true;
    setIsActive(false);
    showMessage('Solving puzzle...', 'info');

    const gridToSolve = cloneGrid(currentGrid);
    let stepCount = 0;

    const visualizeSolving = async (grid: GridType, row: number, col: number) => {
      if (!solvingRef.current) return;

      stepCount++;
      if (stepCount % 3 === 0) {
        setCurrentGrid(cloneGrid(grid));
        setHighlightedCell({ row, col });
        await delay(20);
      }
    };

    await delay(500);

    solveSudoku(gridToSolve, visualizeSolving);

    if (solvingRef.current) {
      setCurrentGrid(gridToSolve);
      setHighlightedCell(null);
      setIsSolving(false);
      showMessage('Puzzle solved automatically!', 'success');
      await saveGameSession(true, true);
    }
  }, [currentGrid, isSolving]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Sudoku Solver
          </h1>
          <p className="text-gray-600">Real-time solving and interactive gameplay</p>
        </div>

        {message && (
          <div className={`
            fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in
            ${message.type === 'success' ? 'bg-green-500 text-white' : ''}
            ${message.type === 'error' ? 'bg-red-500 text-white' : ''}
            ${message.type === 'info' ? 'bg-blue-500 text-white' : ''}
          `}>
            {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {message.type === 'info' && <Timer className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-center gap-8 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Timer className="w-6 h-6 text-blue-500" />
                  <span className="text-2xl font-mono font-bold">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold capitalize">{difficulty}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <SudokuGrid
                grid={currentGrid}
                initialGrid={initialGrid}
                selectedCell={selectedCell}
                onCellClick={handleCellClick}
                highlightedCell={highlightedCell}
              />
            </div>

            {selectedCell && !isSolving && (
              <div className="flex justify-center">
                <NumberPad onNumberSelect={handleNumberSelect} disabled={isSolving} />
              </div>
            )}
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <GameControls
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
                onNewGame={handleNewGame}
                onSolve={handleSolve}
                onCheck={handleCheck}
                onReset={handleReset}
                isSolving={isSolving}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
