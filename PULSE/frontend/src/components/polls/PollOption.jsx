import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';

export function PollOption({ index, value, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center space-x-2 group">
      <div className="flex-shrink-0 text-slate-400 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-400 cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
          placeholder={`Option ${index + 1}`}
          maxLength={120}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent transition-all text-sm"
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className={`p-2.5 rounded-xl transition-colors ${
          canRemove
            ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            : 'text-slate-300 dark:text-navy-700 cursor-not-allowed'
        }`}
        title={canRemove ? 'Remove option' : 'A poll must have at least 2 options'}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default PollOption;

