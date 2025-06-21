import { WordPressCredentials, WordPressPostData, WordPressCategory } from '../types';

// IMPORTANTE: QUESTA È UNA SIMULAZIONE.
// In un'applicazione reale, NON GESTIRE MAI le credenziali di amministrazione di WordPress grezze nel frontend.
// Utilizzare l'API REST di WordPress con autenticazione sicura (ad es. Application Passwords, OAuth2, JWT)
// e, idealmente, effettuare queste chiamate da un server backend per proteggere le credenziali.

export const simulateFetchWordPressCategories = async (
  credentials: WordPressCredentials
): Promise<{ success: boolean; categories?: WordPressCategory[]; message: string }> => {
  console.log('Simulazione recupero categorie da WordPress per:', credentials.siteUrl);
  
  // Simula ritardo chiamata API
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

  if (!credentials.siteUrl || !credentials.username || !credentials.passwordString) {
    return { success: false, message: 'URL WordPress, username e password sono obbligatori per recuperare le categorie.' };
  }

  // Simula un set di categorie. In un'app reale, queste verrebbero da una chiamata API.
  const fetchedCategories: WordPressCategory[] = [
    { id: 1, name: 'Tecnologia', slug: 'tecnologia' },
    { id: 2, name: 'Marketing Digitale', slug: 'marketing-digitale' },
    { id: 3, name: 'Senza categoria', slug: 'senza-categoria' },
    { id: 15, name: 'Recensioni Prodotti', slug: 'recensioni-prodotti' },
    { id: 22, name: 'Guide e Tutorial', slug: 'guide-tutorial' },
  ];

  // Simula un caso in cui il sito non ha categorie o c'è un errore fittizio
  if (credentials.username === 'user_senza_categorie') {
     return { success: true, categories: [], message: 'Nessuna categoria trovata (simulato).' };
  }
  if (credentials.username === 'utente_con_errore_categorie') {
    return { success: false, message: 'Errore simulato durante il recupero delle categorie.' };
  }

  return {
    success: true,
    categories: fetchedCategories,
    message: 'Categorie recuperate con successo (simulato).',
  };
};


export const simulatePostToWordPress = async (
  credentials: WordPressCredentials,
  postData: WordPressPostData 
): Promise<{ success: boolean; message: string; postedData?: WordPressPostData, url?: string }> => {
  console.log('Simulazione invio post a WordPress...');
  console.log('Credenziali:', { ...credentials, passwordString: '********' }); // Non loggare la password effettiva
  console.log('Dati del Post:', postData);
  
  const aioseoTitle = postData.seoTitle || postData.title;
  const aioseoMetaDescription = postData.metaDescription;
  const aioseoFocusKeyphrase = postData.focusKeyword || 'Non specificata';
  const aioseoTags = postData.tags && postData.tags.length > 0 ? postData.tags.join(', ') : 'Nessuno';

  console.log('Dati AIOSEO (simulati):');
  console.log(`  - Titolo Articolo (AIOSEO): ${aioseoTitle}`);
  console.log(`  - Meta Description (AIOSEO): ${aioseoMetaDescription}`);
  console.log(`  - Focus Keyphrase (AIOSEO): ${aioseoFocusKeyphrase}`);
  console.log(`  - Tags (AIOSEO): ${aioseoTags}`);


  if(postData.selectedCategoryId) {
    console.log('ID Categoria WordPress Selezionata:', postData.selectedCategoryId);
  }


  // Simula ritardo chiamata API
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Simulazione validazione di base
  if (!credentials.siteUrl || !credentials.username || !credentials.passwordString) {
    return { success: false, message: 'URL WordPress, username e password sono obbligatori.' };
  }
  if (!postData.title || !postData.body) {
    return { success: false, message: 'Titolo e contenuto del post sono obbligatori.' };
  }

  // Simula successo
  const postSlug = (postData.focusKeyword || postData.title).toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .substring(0, 70);
    
  const siteUrlClean = credentials.siteUrl.replace(/\/$/, '');
  const simulatedPostUrl = `${siteUrlClean}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${postSlug}/`;

  let message = `Post "${postData.title}" PUBBLICATO (SIMULATO) con successo su ${credentials.siteUrl}!`;
  if (postData.selectedCategoryId) {
    message += ` Nella categoria ID: ${postData.selectedCategoryId}.`;
  }
  
  message += `\nCampi AIOSEO (simulati):`;
  message += `\n- Titolo Articolo: "${aioseoTitle}"`;
  message += `\n- Meta Description: "${aioseoMetaDescription}"`;
  message += `\n- Focus Keyphrase: "${aioseoFocusKeyphrase}"`;
  message += `\n- Tags: ${aioseoTags}.`;
  
  message += `\n(Questa è una simulazione). URL Simulata: ${simulatedPostUrl}`;

  return {
    success: true,
    message: message,
    postedData: postData,
    url: simulatedPostUrl,
  };
};