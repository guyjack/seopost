import React, { useState, useEffect } from 'react';
import { WordPressCredentials } from '../types';
import LoadingSpinner from './LoadingSpinner'; // Assumendo che sia utile per un feedback futuro

interface SettingsFormProps {
  initialCredentials: WordPressCredentials | null;
  onSave: (credentials: WordPressCredentials) => Promise<{success: boolean, message: string}>;
  isLoading: boolean; // Per gestire lo stato di caricamento durante il salvataggio
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialCredentials, onSave, isLoading }) => {
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [passwordString, setPasswordString] = useState<string>('');

  useEffect(() => {
    if (initialCredentials) {
      setSiteUrl(initialCredentials.siteUrl);
      setUsername(initialCredentials.username);
      setPasswordString(initialCredentials.passwordString || ''); // Password potrebbe non essere sempre ricaricata per sicurezza
    }
  }, [initialCredentials]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteUrl || !username || !passwordString) {
      // Potrebbe essere gestito da onSave, ma una validazione base qui è utile
      alert("Per favore, compila tutti i campi delle credenziali WordPress.");
      return;
    }
    await onSave({ siteUrl, username, passwordString });
    // Non resettare i campi qui, l'utente potrebbe volerli vedere/modificare
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-3">
        Impostazioni WordPress
      </h2>
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div className="mb-4 p-3 bg-sky-50 border-l-4 border-sky-400 text-sky-700">
          <p className="font-bold">Informazione:</p>
          <p className="text-sm">Le credenziali inserite qui verranno usate per recuperare le categorie e simulare la pubblicazione dei post. Vengono salvate localmente nel tuo browser.</p>
        </div>
        <div>
          <label htmlFor="settings-wp-url" className="block text-sm font-medium text-slate-700 mb-1">
            URL Sito WordPress
          </label>
          <input
            type="url"
            id="settings-wp-url"
            name="settings-wp-url"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-2.5"
            placeholder="https://tuosito.com"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label htmlFor="settings-wp-username" className="block text-sm font-medium text-slate-700 mb-1">
            Username Amministratore WordPress
          </label>
          <input
            type="text"
            id="settings-wp-username"
            name="settings-wp-username"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-2.5"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label htmlFor="settings-wp-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password Amministratore WordPress
          </label>
          <input
            type="password"
            id="settings-wp-password"
            name="settings-wp-password"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-2.5"
            placeholder="••••••••"
            value={passwordString}
            onChange={(e) => setPasswordString(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !siteUrl.trim() || !username.trim() || !passwordString.trim()}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="w-5 h-5" color="text-white" className="mr-2" />
              Salvataggio...
            </>
          ) : (
            'Salva Impostazioni WordPress'
          )}
        </button>
      </form>
    </div>
  );
};

export default SettingsForm;
