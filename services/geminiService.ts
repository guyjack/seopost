
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratedPostContent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set in process.env.API_KEY. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateImageForPost = async (promptForImage: string): Promise<string | null> => {
  if (!ai) {
    console.warn("Gemini API client (for images) is not initialized. API_KEY might be missing.");
    return null;
  }
  const imageModel = 'imagen-3.0-generate-002';
  try {
    console.log(`Richiesta immagine con prompt: "${promptForImage}"`);
    const response = await ai.models.generateImages({
        model: imageModel,
        prompt: `A high-quality, SEO-friendly blog post image related to the topic: "${promptForImage}". Visually appealing, suitable for web, and illustrative. Focus on a clean and modern aesthetic.`,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    console.warn("Nessuna immagine generata o dati immagine mancanti nella risposta.");
    return null;
  } catch (error) {
    console.error("Errore durante la generazione dell'immagine con Gemini:", error);
    // Non lanciare un errore qui per non bloccare la generazione del testo
    return null;
  }
};

export const generateBlogPostContent = async (topic: string): Promise<GeneratedPostContent> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. API_KEY might be missing.");
  }

  const model = "gemini-2.5-flash-preview-04-17";
  
  const prompt = `
Sei un esperto redattore di contenuti e specialista SEO. Genera un post per un blog in italiano sull'argomento: "${topic}".
Il post deve essere ottimizzato per la SEO. Per favore, fornisci la risposta ESCLUSIVAMENTE in formato JSON con la seguente struttura:
{
  "title": "Un titolo accattivante e ottimizzato per la SEO per il post (massimo 70 caratteri)",
  "body": "<p>Il contenuto del post, scritto in HTML. Dovrebbe essere informativo, coinvolgente e ben strutturato con paragrafi. Crea almeno 3-4 paragrafi di contenuto.</p><p>Assicurati che l'HTML sia valido e ben formattato.</p>",
  "seoTitle": "Un titolo specifico per i motori di ricerca (massimo 60 caratteri, se diverso dal titolo principale, altrimenti ripeti il titolo principale)",
  "metaDescription": "Una meta description concisa e persuasiva (massimo 160 caratteri) che riassuma il post e invogli al click.",
  "focusKeyword": "La parola chiave principale su cui si concentra il post",
  "tags": ["lista", "di", "3-5", "tag", "pertinenti"],
  "categories": ["Una categoria principale per il post, ad esempio 'Marketing Digitale' o 'Tecnologia'],
  "imageAltText": "Un testo alternativo pertinente, descrittivo e ottimizzato SEO per un'immagine rappresentativa del post (massimo 125 caratteri)"
}

Assicurati che il campo 'body' contenga HTML valido e che l'intero output sia un singolo oggetto JSON valido senza testo o markdown aggiuntivo attorno ad esso.
Non includere commenti nel JSON.
Rispetta la lunghezza massima specificata per titolo, meta description e imageAltText.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // Parsare GeneratedPostContent senza imageUrl, che verrà aggiunto dopo
    const parsedTextData = JSON.parse(jsonStr) as Omit<GeneratedPostContent, 'imageUrl'>;

    if (
        typeof parsedTextData.title !== 'string' ||
        typeof parsedTextData.body !== 'string' ||
        typeof parsedTextData.metaDescription !== 'string' ||
        typeof parsedTextData.imageAltText !== 'string' || // Verifica nuovo campo
        !Array.isArray(parsedTextData.tags) ||
        !Array.isArray(parsedTextData.categories)
    ) {
        throw new Error("Il formato JSON ricevuto dall'API per il testo non è valido o mancano campi obbligatori.");
    }
    
    // Genera l'immagine usando il titolo o la focus keyword
    let imageUrl: string | null = null;
    const imagePrompt = parsedTextData.focusKeyword || parsedTextData.title;
    if (imagePrompt) {
        imageUrl = await generateImageForPost(imagePrompt);
    }

    return {
        ...parsedTextData,
        imageUrl: imageUrl || undefined, // Assicura che sia undefined se null
    };

  } catch (error) {
    console.error("Errore durante la generazione del contenuto con Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             throw new Error("La chiave API di Gemini non è valida. Controlla la configurazione.");
        }
         throw new Error(`Errore Gemini: ${error.message}`);
    }
    throw new Error("Errore sconosciuto durante la generazione del contenuto.");
  }
};