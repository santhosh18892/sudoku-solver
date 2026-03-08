import { Difficulty } from '../utils/sudoku';
import { Sparkles, RotateCcw, Play, Pause, Check } from 'lucide-react';

interface GameControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onSolve: () => void;
  onCheck: () => void;
  onReset: () => void;
  isSolving: boolean;
}

export default function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onSolve,
  onCheck,
  onReset,
  isSolving
}: GameControlsProps) {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Difficulty Level
        </label>
        <div className="grid grid-cols-2 gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => onDifficultyChange(diff)}
              className={`
                px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200
                ${
                  difficulty === diff
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                }
              `}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onNewGame}
          disabled={isSolving}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          New Game
        </button>

        <button
          onClick={onSolve}
          disabled={isSolving}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSolving ? (
            <>
              <Pause className="w-5 h-5" />
              Solving...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Auto Solve
            </>
          )}
        </button>

        <button
          onClick={onCheck}
          disabled={isSolving}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Check Solution
        </button>

        <button
          onClick={onReset}
          disabled={isSolving}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset Puzzle
        </button>
      </div>
    </div>
  );
}
