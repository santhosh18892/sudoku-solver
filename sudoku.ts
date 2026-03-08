import { SudokuGrid as GridType } from '../utils/sudoku';

interface SudokuGridProps {
  grid: GridType;
  initialGrid: GridType;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  highlightedCell?: { row: number; col: number } | null;
}

export default function SudokuGrid({
  grid,
  initialGrid,
  selectedCell,
  onCellClick,
  highlightedCell
}: SudokuGridProps) {
  const isCellInitial = (row: number, col: number) => {
    return initialGrid[row][col] !== null;
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCell?.row === row && selectedCell?.col === col;
  };

  const isCellHighlighted = (row: number, col: number) => {
    return highlightedCell?.row === row && highlightedCell?.col === col;
  };

  const getCellClasses = (row: number, col: number) => {
    const classes = [
      'w-full h-full flex items-center justify-center text-lg font-semibold transition-all duration-150 cursor-pointer'
    ];

    if (isCellInitial(row, col)) {
      classes.push('bg-gray-100 text-gray-800 font-bold');
    } else {
      classes.push('bg-white text-blue-600 hover:bg-blue-50');
    }

    if (isCellSelected(row, col)) {
      classes.push('ring-2 ring-blue-500 ring-inset bg-blue-100 z-10');
    }

    if (isCellHighlighted(row, col)) {
      classes.push('bg-green-200 animate-pulse');
    }

    if (selectedCell && !isCellSelected(row, col)) {
      if (selectedCell.row === row || selectedCell.col === col) {
        classes.push('bg-blue-50');
      }
      const selectedBox = {
        row: Math.floor(selectedCell.row / 3),
        col: Math.floor(selectedCell.col / 3)
      };
      const currentBox = {
        row: Math.floor(row / 3),
        col: Math.floor(col / 3)
      };
      if (selectedBox.row === currentBox.row && selectedBox.col === currentBox.col) {
        classes.push('bg-blue-50');
      }
    }

    return classes.join(' ');
  };

  return (
    <div className="inline-block bg-gray-800 p-2 rounded-lg shadow-2xl">
      <div className="grid grid-cols-9 gap-0 bg-gray-800">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                relative w-12 h-12 sm:w-14 sm:h-14
                ${colIndex % 3 === 2 && colIndex !== 8 ? 'border-r-2 border-gray-800' : 'border-r border-gray-300'}
                ${rowIndex % 3 === 2 && rowIndex !== 8 ? 'border-b-2 border-gray-800' : 'border-b border-gray-300'}
              `}
            >
              <button
                onClick={() => !isCellInitial(rowIndex, colIndex) && onCellClick(rowIndex, colIndex)}
                className={getCellClasses(rowIndex, colIndex)}
                disabled={isCellInitial(rowIndex, colIndex)}
              >
                {cell !== null ? cell : ''}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
