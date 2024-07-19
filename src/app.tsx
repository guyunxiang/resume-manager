import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from '@blocklet/ui-react/lib/Header';
import { LocaleProvider } from '@arcblock/ux/lib/Locale/context';
// import { createAuthServiceSessionContext } from '@arcblock/did-connect/lib/Session';

// import Footer from '@blocklet/ui-react/lib/Footer';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import { useMemo, useState } from 'react';
import { PreviewContext } from './components/preview-context';

import Home from './pages/home';
import Resume from './pages/resume';

import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';

// const { SessionProvider } = createAuthServiceSessionContext();
interface Translations {
  [key: string]: string | { [key: string]: string };
}
const translations: { [key: string]: Translations } = {
  en: enTranslations,
  zh: zhTranslations,
};

function App() {
  // While the blocklet is deploy to a sub path, this will be work properly.
  const basename = window?.blocklet?.prefix || '/';
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Resume />} />
        <Route path="/profile/:id" element={<Resume />} />
        <Route path="/profile/new" element={<Resume />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function WrappedApp() {
  const [previewMode, setPreviewMode] = useState(false);

  const contextValue = useMemo(() => ({ previewMode, setPreviewMode }), [previewMode]);

  return (
    <LocaleProvider translations={translations} defaultLocale="en">
      {/* <SessionProvider> */}
      <PreviewContext.Provider value={contextValue}>
        {!previewMode && <Header />}
        <App />
        {/* <Footer /> */}
        {!previewMode && (
          <footer>
            Powered by{' '}
            <a href="http://github.com/guyunxiang" target="_blank" rel="noopener noreferrer">
              guyunxiang
            </a>
          </footer>
        )}
        <ToastContainer position="bottom-right" pauseOnHover={false} autoClose={3000} />
      </PreviewContext.Provider>
      {/* </SessionProvider> */}
    </LocaleProvider>
  );
}
