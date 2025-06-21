
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface TopicFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  isApiKeyMissing: boolean;
}

const TopicForm: React.FC<TopicFormProps> = ({ onSubmit, isLoading, isApiKeyMissing }) => {
  const [topic, setTopic] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading && !isApiKeyMissing) {
      onSubmit(topic.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">
          Argomento del Post
        </label>
        <textarea
          id="topic"
          name="topic"
          rows={3}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-2.5"
          placeholder="Es: I migliori plugin SEO per WordPress nel 2024"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading || isApiKeyMissing}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !topic.trim() || isApiKeyMissing}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="w-5 h-5" color="text-white" className="mr-2" />
            Generazione in corso...
          </>
        ) : (
          'Genera Contenuto Articolo'
        )}
      </button>
      {isApiKeyMissing && (
         <p className="text-xs text-red-600 mt-1">La chiave API di Gemini non è configurata. La generazione di contenuti è disabilitata.</p>
      )}
    </form>
  );
};

export default TopicForm;
