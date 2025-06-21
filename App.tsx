
import React, { useState, useCallback, useEffect } from 'react';
import TopicForm from './components/TopicForm';
import PostDisplay from './components/PostDisplay';
import WordPressForm from './components/WordPressForm';
import SettingsForm from './components/SettingsForm'; // Importa il nuovo componente
import Alert from './components/Alert';
import { generateBlogPostContent } from './services/geminiService';
import { simulatePostToWordPress, simulateFetchWordPressCategories } from './services/wordpressService';
import { 
  GeneratedPostContent, 
  WordPressCredentials, 
  AlertMessage, 
  AlertType, 
  WordPressPostData,
  WordPressCategory
} from './types';

const WORDPRESS_CREDS_LOCALSTORAGE_KEY = 'wpCredsGlobal';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedPostContent | null>(null);
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [isLoadingWordPress, setIsLoadingWordPress] = useState<boolean>(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(false); 
  const [isLoadingWPCategories, setIsLoadingWPCategories] = useState<boolean>(false); // Per caricamento categorie
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [simulatedPostUrl, setSimulatedPostUrl] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);

  const [wordPressCredentials, setWordPressCredentials] = useState<WordPressCredentials | null>(null);
  const [wordPressCategories, setWordPressCategories] = useState<WordPressCategory[] | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      addAlert('La chiave API di Gemini (process.env.API_KEY) non è configurata. Le funzionalità AI sono disabilitate.', AlertType.Error);
      setIsApiKeyMissing(true);
    }

    const loadInitialData = async () => {
      try {
        const savedCredsString = localStorage.getItem(WORDPRESS_CREDS_LOCALSTORAGE_KEY);
        if (savedCredsString) {
          const savedCreds = JSON.parse(savedCredsString) as WordPressCredentials;
          if (savedCreds.siteUrl && savedCreds.username && savedCreds.passwordString) {
            setWordPressCredentials(savedCreds);
            // Auto-fetch categories if credentials exist on load
            // Call and await the async function handleFetchWordPressCategories
            await handleFetchWordPressCategories(savedCreds);
          }
        }
      } catch (error) {
        console.warn("Errore nel caricamento delle credenziali WordPress da localStorage:", error);
        addAlert("Errore nel caricamento delle impostazioni WordPress salvate.", AlertType.Warning);
      }
    };

    loadInitialData();

  }, []); // Runs once on mount. handleFetchWordPressCategories is called with explicit creds.


  const addAlert = (message: string, type: AlertType) => {
    const id = Date.now().toString();
    setAlerts(prevAlerts => [{ id, message, type }, ...prevAlerts.slice(0, 4)]);
    setTimeout(() => {
        removeAlert(id);
    }, type === AlertType.Error || type === AlertType.Warning ? 10000 : 5000);
  };

  const removeAlert = (id: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  };
  
  const handleFetchWordPressCategories = useCallback(async (credsToUse: WordPressCredentials | null): Promise<{ success: boolean; categories?: WordPressCategory[]; message: string }> => {
    const currentCreds = credsToUse || wordPressCredentials; // Usa le credenziali passate o quelle globali
    if (!currentCreds) {
        addAlert("Credenziali WordPress non configurate. Vai su Impostazioni.", AlertType.Warning);
        return { success: false, message: "Credenziali WordPress non configurate."};
    }
    setIsLoadingWPCategories(true);
    setWordPressCategories(null); // Clear previous categories
    try {
      const result = await simulateFetchWordPressCategories(currentCreds);
      if (result.success && result.categories) {
        setWordPressCategories(result.categories);
        // Alert can be less intrusive if it's an auto-fetch
        // addAlert(result.message || 'Categorie caricate.', result.categories.length > 0 ? AlertType.Info : AlertType.Warning);
      } else {
        setWordPressCategories([]); // Ensure it's an empty array on failure or no categories
        addAlert(result.message || 'Impossibile caricare le categorie.', AlertType.Warning);
      }
      return result;
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Errore recupero categorie.';
      setWordPressCategories([]);
      addAlert(msg, AlertType.Error);
      return { success: false, message: msg };
    } finally {
        setIsLoadingWPCategories(false);
    }
  }, [wordPressCredentials]); // Dependency on wordPressCredentials if credsToUse is not provided

  const handleSaveWordPressCredentials = useCallback(async (creds: WordPressCredentials): Promise<{success: boolean, message: string}> => {
    setIsLoadingSettings(true);
    try {
      localStorage.setItem(WORDPRESS_CREDS_LOCALSTORAGE_KEY, JSON.stringify(creds));
      setWordPressCredentials(creds);
      setWordPressCategories(null); // Resetta categorie esistenti
      
      addAlert('Impostazioni WordPress salvate. Caricamento categorie...', AlertType.Info);
      
      // Fetch categories immediately after saving credentials
      const fetchResult = await handleFetchWordPressCategories(creds); // Pass new creds directly
      if (fetchResult.success) {
        addAlert(fetchResult.message || (fetchResult.categories && fetchResult.categories.length > 0 ? 'Categorie caricate con successo.' : 'Nessuna categoria trovata.'), AlertType.Success);
      } else {
        // Error already handled by handleFetchWordPressCategories's own alert
      }
      setIsLoadingSettings(false); // Consider the whole operation (save + fetch)
      return { success: true, message: 'Impostazioni WordPress salvate e categorie aggiornate.' };

    } catch (error) {
      console.error("Errore nel salvataggio delle credenziali WordPress:", error);
      addAlert('Errore durante il salvataggio delle impostazioni WordPress.', AlertType.Error);
      setIsLoadingSettings(false);
      return { success: false, message: 'Errore durante il salvataggio delle impostazioni WordPress.' };
    }
  }, [handleFetchWordPressCategories]);


  const handleGenerateContent = useCallback(async (currentTopic: string) => {
    if (isApiKeyMissing) {
      addAlert('Impossibile generare contenuto: API key mancante.', AlertType.Error);
      return;
    }
    setTopic(currentTopic);
    setIsLoadingGemini(true);
    setGeneratedContent(null);
    setSimulatedPostUrl(null);
    try {
      const content = await generateBlogPostContent(currentTopic);
      setGeneratedContent(content);
      addAlert('Contenuto generato con successo!', AlertType.Success);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto durante la generazione del contenuto.';
      addAlert(errorMessage, AlertType.Error);
    } finally {
      setIsLoadingGemini(false);
    }
  }, [isApiKeyMissing]);

  const handlePublishToWordPress = useCallback(async (selectedCategoryId?: number) => { // Modificato
    if (!generatedContent) {
      addAlert('Nessun contenuto da pubblicare. Genera prima il contenuto.', AlertType.Warning);
      return;
    }
    if (!wordPressCredentials) {
        addAlert("Credenziali WordPress non configurate. Vai su Impostazioni per impostarle.", AlertType.Error);
        return;
    }

    setIsLoadingWordPress(true);
    setSimulatedPostUrl(null);

    const postData: WordPressPostData = {
      ...generatedContent,
      status: 'publish',
      selectedCategoryId: selectedCategoryId, // Modificato
    };

    try {
      const result = await simulatePostToWordPress(wordPressCredentials, postData);
      if (result.success) {
        addAlert(result.message, AlertType.Success);
        if(result.url) setSimulatedPostUrl(result.url);
      } else {
        addAlert(result.message, AlertType.Error);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto durante la simulazione della pubblicazione.';
      addAlert(errorMessage, AlertType.Error);
    } finally {
      setIsLoadingWordPress(false);
    }
  }, [generatedContent, wordPressCredentials]);
  
  // Wrapper for handleFetchWordPressCategories to be used by button without args
  const triggerFetchCategories = useCallback(() => {
    return handleFetchWordPressCategories(wordPressCredentials);
  }, [handleFetchWordPressCategories, wordPressCredentials]);


  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 sm:text-5xl">
          Generatore Post WordPress <span className="text-blue-600">AI</span>
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Crea contenuti ottimizzati SEO con l'intelligenza artificiale e simula la pubblicazione sul tuo blog WordPress.
        </p>
      </header>

      <div className="fixed top-5 right-5 w-full max-w-sm z-50">
        {alerts.map(alert => (
          <Alert key={alert.id} {...alert} onDismiss={removeAlert} />
        ))}
      </div>

      <main className="max-w-4xl mx-auto space-y-8">
        <section id="settings-step">
          <SettingsForm 
            initialCredentials={wordPressCredentials}
            onSave={handleSaveWordPressCredentials}
            isLoading={isLoadingSettings || isLoadingWPCategories} // loading state now covers category fetch
          />
        </section>

        <section id="generation-step" className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-3">
            Passo 1: Genera il Contenuto dell'Articolo
          </h2>
          <TopicForm 
            onSubmit={handleGenerateContent} 
            isLoading={isLoadingGemini}
            isApiKeyMissing={isApiKeyMissing}
          />
        </section>

        {generatedContent && (
          <>
            <section id="content-preview-step" className="scroll-mt-20">
              <PostDisplay post={generatedContent} simulatedUrl={simulatedPostUrl} />
            </section>
            
            <section id="publish-step" className="scroll-mt-20">
              <WordPressForm 
                onPublish={handlePublishToWordPress} 
                onFetchCategories={triggerFetchCategories} // Usa la funzione trigger
                isPublishing={isLoadingWordPress}
                isLoadingCategories={isLoadingWPCategories}
                isFormDisabled={!generatedContent || isLoadingGemini || !wordPressCredentials}
                wordPressSiteUrl={wordPressCredentials?.siteUrl || null}
                wordPressUsername={wordPressCredentials?.username || null} 
                fetchedCategories={wordPressCategories}
                areCredentialsSet={!!wordPressCredentials}
              />
            </section>
          </>
        )}
      </main>

      <footer className="mt-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Generatore Post WordPress AI. Tutti i diritti riservati (simulazione).</p>
        <p className="mt-1">Creato con React, Tailwind CSS e Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
