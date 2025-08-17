import React from 'react';
import { Plus, Trash } from './Icons';

interface TableProps {
  data: string[][];
  onChange: (data: string[][] | null) => void;
}

const TableComponent: React.FC<TableProps> = ({ data, onChange }) => {
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map(row => [...row]);
    newData[rowIndex][colIndex] = value;
    onChange(newData);
  };

  const handleAddRow = (index: number) => {
    const newData = data.map(row => [...row]);
    const newRow = new Array(data[0]?.length || 1).fill('');
    newData.splice(index + 1, 0, newRow);
    onChange(newData);
  };

  const handleRemoveRow = (index: number) => {
    if (data.length <= 1) return; // Don't remove the last row
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const handleAddColumn = (index: number) => {
    const newData = data.map(row => {
      const newRow = [...row];
      newRow.splice(index + 1, 0, '');
      return newRow;
    });
    onChange(newData);
  };

  const handleRemoveColumn = (index: number) => {
    if (data[0]?.length <= 1) return; // Don't remove the last column
    const newData = data.map(row => row.filter((_, i) => i !== index));
    onChange(newData);
  };
  
  const handleRemoveTable = () => {
    onChange(null);
  };
  
  const colCount = data[0]?.length || 0;

  return (
    <div className="relative group/table mt-8 w-full overflow-x-auto animate-pop-in">
      <button 
        onClick={handleRemoveTable}
        className="absolute -top-4 -right-4 z-10 p-1 bg-white dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 opacity-0 group-hover/table:opacity-100 transition-all hover:scale-125 active:scale-100"
        title="Remove Table"
        aria-label="Remove table"
      >
        <Trash className="w-5 h-5" />
      </button>
      <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/20 rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="border-b border-zinc-300 dark:border-zinc-700 w-10 bg-zinc-50 dark:bg-zinc-800/30"></th>
            {Array.from({ length: colCount }).map((_, colIndex) => (
              <th key={colIndex} className="relative group/th border-b border-zinc-300 dark:border-zinc-700 p-1 bg-zinc-50 dark:bg-zinc-800/30">
                <div className="flex justify-center items-center h-8">
                   <button 
                      onClick={() => handleRemoveColumn(colIndex)} 
                      className="text-zinc-400 hover:text-red-500 opacity-0 group-hover/th:opacity-100 transition-opacity hover:scale-125"
                      title="Delete Column"
                      aria-label="Delete column"
                    >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleAddColumn(colIndex)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-yellow-400 dark:hover:bg-yellow-500 opacity-0 group-hover/table:opacity-100 transition-all scale-75 group-hover/th:scale-100 group-hover/table:animate-jiggle"
                  title="Add Column"
                  aria-label="Add column"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="relative group/tr">
              <td className="relative group/td border-r border-zinc-300 dark:border-zinc-700 p-1 bg-zinc-50 dark:bg-zinc-800/30">
                 <div className="flex justify-center items-center h-full w-8">
                    <button 
                      onClick={() => handleRemoveRow(rowIndex)}
                      className="text-zinc-400 hover:text-red-500 opacity-0 group-hover/td:opacity-100 transition-opacity hover:scale-125"
                      title="Delete Row"
                      aria-label="Delete row"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                <button
                  onClick={() => handleAddRow(rowIndex)}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-yellow-400 dark:hover:bg-yellow-500 opacity-0 group-hover/table:opacity-100 transition-all scale-75 group-hover/tr:scale-100 group-hover/table:animate-jiggle"
                  title="Add Row"
                  aria-label="Add row"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </td>
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border-t border-zinc-300 dark:border-zinc-700">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    className="w-full h-full p-2 bg-transparent focus:outline-none focus:bg-yellow-100/50 dark:focus:bg-yellow-500/20 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400/80 dark:placeholder:text-zinc-500/80"
                    aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;