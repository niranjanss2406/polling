import React, { useState } from 'react';
import { Plus, Clock, HelpCircle, CheckSquare, Square, Calendar } from 'lucide-react';
import PollOption from './PollOption';
import { validatePollForm } from '../../utils/validators';

export function PollForm({ initialData = null, onSubmit, isSubmitting = false }) {
  const [question, setQuestion] = useState(initialData?.question || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [options, setOptions] = useState(
    initialData?.options
      ? initialData.options.map((o) => (typeof o === 'string' ? o : o.text))
      : ['', '']
  );
  const [allowMultiple, setAllowMultiple] = useState(initialData?.allow_multiple || false);
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expires_at ? new Date(initialData.expires_at).toISOString().slice(0, 16) : ''
  );
  const [errors, setErrors] = useState({});

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      question,
      description,
      options,
      allow_multiple: allowMultiple,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    const validation = validatePollForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          Poll Question <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which modern tech stack should we adopt in Q3?"
          maxLength={300}
          className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-navy-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pulse-500 transition-all text-base ${
            errors.question ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
          }`}
        />
        {errors.question && (
          <p className="text-xs font-medium text-rose-500">{errors.question}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          Description <span className="text-xs font-normal text-slate-400">(Optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add extra context, voting criteria, or notes for your audience..."
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pulse-500 transition-all text-sm resize-none"
        />
      </div>

      {/* Options List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Voting Options <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {options.length}/10 options
          </span>
        </div>

        <div className="space-y-2.5">
          {options.map((opt, idx) => (
            <PollOption
              key={idx}
              index={idx}
              value={opt}
              onChange={handleOptionChange}
              onRemove={removeOption}
              canRemove={options.length > 2}
            />
          ))}
        </div>

        {errors.options && (
          <p className="text-xs font-medium text-rose-500">{errors.options}</p>
        )}

        {options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-pulse-600 dark:text-pulse-400 bg-pulse-50 dark:bg-navy-800 hover:bg-pulse-100 dark:hover:bg-navy-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Option</span>
          </button>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-navy-800">
        {/* Voting Type */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-900/50 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <span>Voting Rule</span>
          </label>
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => setAllowMultiple(false)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                !allowMultiple
                  ? 'bg-pulse-600 text-white shadow-sm'
                  : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700'
              }`}
            >
              <span>Single Choice</span>
            </button>
            <button
              type="button"
              onClick={() => setAllowMultiple(true)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                allowMultiple
                  ? 'bg-pulse-600 text-white shadow-sm'
                  : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700'
              }`}
            >
              <span>Multiple Choice</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {allowMultiple
              ? 'Audience can pick one or more options.'
              : 'Audience can choose exactly one option.'}
          </p>
        </div>

        {/* Expiration Date */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-900/50 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Poll Expiration (Optional)</span>
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-pulse-500"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Voting will automatically close at this time. Leave empty for no limit.
          </p>
          {errors.expires_at && (
            <p className="text-xs font-medium text-rose-500">{errors.expires_at}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-lg shadow-pulse-500/25 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
        >
          {isSubmitting ? 'Creating Poll...' : initialData ? 'Update Poll' : 'Publish Interactive Poll'}
        </button>
      </div>
    </form>
  );
}

export default PollForm;

