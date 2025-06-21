import React, { useState, useEffect } from 'react';
import { WordPressCategory } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface WordPressFormProps {
  onPublish: (selectedCategoryId?: number) => void; // Modificato per ID singolo opzionale
  onFetchCategories: () => Promise<unknown>; // Rimosso tipo di ritorno specifico, gestito da App
  isPublishing: boolean;
  isLoadingCategories: boolean; // Nuovo prop per lo stato di caricamento delle categorie
  isFormDisabled: boolean; 
  wordPressSiteUrl: string | null; 
  wordPressUsername: string | null; 
  fetchedCategories: WordPressCategory[] | null;
  areCredentialsSet: boolean;
}

const WordPressForm: React.FC<WordPressFormProps> = ({ 
  onPublish, 
  onFetchCategories, 
  isPublishing,
  isLoadingCategories, 
  isFormDisabled,
  wordPressSiteUrl,
  wordPressUsername,
  fetchedCategories,
  areCredentialsSet
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // Sarà l'ID come stringa, o ''
  const [categoryFetchMessage, setCategoryFetchMessage] = useState<string | null>(null); // Mantenuto per messaggi di ricarica

  useEffect(() => {
    setSelectedCategoryId(''); // Resetta la selezione quando le categorie cambiano/vengono ricaricate
    setCategoryFetchMessage(null);
    if (areCredentialsSet && fetchedCategories === null && !isLoadingCategories) {
        // Se le credenziali sono settate, ma non ci sono categorie e non stiamo caricando,
        // potrebbe essere il caricamento iniziale fallito o non ancora avvenuto.
        // Un messaggio potrebbe essere utile, o lasciare che App.tsx lo gestisca.
    } else if (fetchedCategories && fetchedCategories.length === 0 && !isLoadingCategories) {
        setCategoryFetchMessage("Nessuna categoria trovata per il sito configurato o l'utente non ha permessi.");
    }
  }, [fetchedCategories, areCredentialsSet, isLoadingCategories]);


  const handleRefreshCategories = async () => {
    if (!areCredentialsSet) {
      setCategoryFetchMessage("Credenziali WordPress non configurate. Vai su 'Impostazioni'.");
      return;
    }
    setCategoryFetchMessage('Ricaricamento categorie...');
    await onFetchCategories(); 
    // Il messaggio di successo/errore verrà gestito da App.tsx tramite alerts
    // e l'useEffect qui sopra potrebbe aggiornare categoryFetchMessage se necessario
    // per "Nessuna categoria trovata"
    setCategoryFetchMessage(null); // Clear manual message after attempt
  };

  const handleSubmitToWordPress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormDisabled && !isPublishing && areCredentialsSet) {
      const categoryIdNum = selectedCategoryId ? parseInt(selectedCategoryId, 10) : undefined;
      onPublish(categoryIdNum);
    } else if (!areCredentialsSet) {
        setCategoryFetchMessage("Impossibile pubblicare: credenziali WordPress non configurate. Vai su 'Impostazioni'.");
    }
  };
  
  const canInteractWithWordPress = areCredentialsSet && !isFormDisabled;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Passo 2: Pubblica su WordPress (Simulazione)</h2>
      
      {!areCredentialsSet && (
        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-700">
          <p className="font-bold">Credenziali WordPress Mancanti</p>
          <p className="text-sm">Per favore, vai alla sezione "Impostazioni WordPress" per configurare URL, username e password del tuo sito prima di procedere.</p>
        </div>
      )}

      {areCredentialsSet && wordPressSiteUrl && (
         <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700">
            <p className="font-semibold">Configurazione WordPress Attiva:</p>
            <p className="text-sm">Sito: <span className="font-medium">{wordPressSiteUrl}</span></p>
            {wordPressUsername && <p className="text-sm">Utente: <span className="font-medium">{wordPressUsername}</span></p>}
         </div>
      )}
      
      <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
        <p className="font-bold">Nota di Sicurezza Importante:</p>
        <p className="text-sm">Questa è una simulazione. In un'applicazione reale, non inserire mai le tue credenziali di amministratore WordPress direttamente in un'applicazione frontend. Utilizza metodi di autenticazione sicuri come le Application Passwords di WordPress e gestisci le chiamate API preferibilmente tramite un backend.</p>
      </div>

      <form onSubmit={handleSubmitToWordPress} className="space-y-4">
        
        {areCredentialsSet && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
                <label htmlFor="wp-category-select" className="block text-md font-medium text-slate-700">
                    Seleziona Categoria WordPress:
                </label>
                <button
                  type="button"
                  onClick={handleRefreshCategories}
                  disabled={!canInteractWithWordPress || isLoadingCategories || isPublishing}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                  aria-label="Ricarica categorie WordPress"
                >
                  {isLoadingCategories ? <LoadingSpinner size="w-4 h-4 inline-block mr-1" color="text-blue-600" /> : null}
                  Ricarica Categorie
                </button>
            </div>
             {isLoadingCategories && !fetchedCategories && <p className="text-sm text-slate-500">Caricamento categorie...</p>}
            <select
              id="wp-category-select"
              name="wp-category"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-2.5 disabled:bg-slate-50"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={!canInteractWithWordPress || isPublishing || isLoadingCategories || !fetchedCategories || fetchedCategories.length === 0}
            >
              <option value="" disabled={!!selectedCategoryId}>
                {isLoadingCategories ? 'Attendere...' : (fetchedCategories && fetchedCategories.length > 0 ? '-- Seleziona una categoria --' : '-- Nessuna categoria disponibile --')}
              </option>
              {fetchedCategories && fetchedCategories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoryFetchMessage && <p className="text-sm text-slate-600 mt-1">{categoryFetchMessage}</p>}
          </div>
        )}
         
        <button
          type="submit"
          disabled={!canInteractWithWordPress || isPublishing }
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <>
              <LoadingSpinner size="w-5 h-5" color="text-white" className="mr-2" />
              Pubblicazione (simulata)...
            </>
          ) : (
            'Pubblica su WordPress (Simulato)'
          )}
        </button>
      </form>
    </div>
  );
};

export default WordPressForm;