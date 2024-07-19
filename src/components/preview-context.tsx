import React from 'react';

interface PreviewContextType {
  previewMode: boolean;
  setPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PreviewContext = React.createContext<PreviewContextType | undefined>(undefined);

export function usePreviewContext() {
  const context = React.useContext(PreviewContext);
  if (context === undefined) {
    throw new Error('usePreviewContext must be used within a PreviewProvider');
  }
  return context;
}
