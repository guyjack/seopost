export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  passwordString: string; // Anche se non la mostriamo spesso, è necessaria per le chiamate API
}

export interface GeneratedPostContent {
  title: string;
  body: string; // HTML content for the post
  seoTitle?: string;
  metaDescription: string;
  focusKeyword?: string;
  tags?: string[];
  categories?: string[]; // Categories suggested by AI
  imageUrl?: string; // URL base64 dell'immagine generata
  imageAltText?: string; // Testo alternativo per l'immagine
}

export enum AlertType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export interface AlertMessage {
  id: string;
  type: AlertType;
  message: string;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string; 
}

export interface WordPressPostData extends GeneratedPostContent {
  status: 'publish' | 'draft';
  selectedCategoryId?: number; // Modificato da selectedCategoryIds: number[]
}