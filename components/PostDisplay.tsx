import React from 'react';
import { GeneratedPostContent } from '../types';

interface PostDisplayProps {
  post: GeneratedPostContent | null;
  simulatedUrl?: string | null;
}

const PostDisplay: React.FC<PostDisplayProps> = ({ post, simulatedUrl }) => {
  if (!post) {
    return null;
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-slate-800 border-b pb-2">Contenuto Generato</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-700">Titolo del Post:</h3>
        <p className="text-slate-600 text-xl">{post.title}</p>
      </div>

      {post.imageUrl && (
        <div className="space-y-3 my-4">
          <h3 className="text-lg font-medium text-slate-700">Immagine Suggerita:</h3>
          <img 
            src={post.imageUrl} 
            alt={post.imageAltText || 'Immagine generata per il post'} 
            className="rounded-lg shadow-md max-w-full md:max-w-md lg:max-w-lg mx-auto h-auto border border-slate-200"
          />
          {post.imageAltText && (
            <p className="text-sm text-slate-600 italic text-center mt-1">
              Testo Alt: "{post.imageAltText}"
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-700">Contenuto (HTML):</h3>
        <div 
          className="prose max-w-none p-4 border border-slate-200 rounded-md bg-slate-50 overflow-auto max-h-96" // Rimosso 'prose-slate'
          style={{ '--tw-prose-body': '#000000' } as React.CSSProperties} // Mantenuto per impostare il colore del corpo del testo a nero
          dangerouslySetInnerHTML={{ __html: post.body }} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <h3 className="text-lg font-medium text-slate-700">Titolo SEO:</h3>
            <p className="text-slate-600">{post.seoTitle || post.title}</p>
        </div>
        <div className="space-y-2">
            <h3 className="text-lg font-medium text-slate-700">Parola Chiave Focus:</h3>
            <p className="text-slate-600">{post.focusKeyword || 'N/A'}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-700">Meta Description:</h3>
        <p className="text-slate-600 text-sm italic p-2 bg-slate-50 border border-slate-200 rounded">{post.metaDescription}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-700">Tags:</h3>
        {post.tags && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {tag}
              </span>
            ))}
          </div>
        ) : <p className="text-slate-500 text-sm">Nessun tag suggerito.</p>}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-700">Categorie Suggerite (AI):</h3>
        {post.categories && post.categories.length > 0 ? (
         <div className="flex flex-wrap gap-2">
            {post.categories.map((category, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {category}
              </span>
            ))}
          </div>
        ) : <p className="text-slate-500 text-sm">Nessuna categoria suggerita.</p>}
      </div>

      {simulatedUrl && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
            <h4 className="font-semibold text-yellow-800">URL Simulata del Post Pubblicato:</h4>
            <a href={simulatedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all">{simulatedUrl}</a>
            <p className="text-xs text-yellow-700 mt-1">(Questo è un URL di simulazione e non punta a un post reale)</p>
        </div>
      )}
    </div>
  );
};

export default PostDisplay;