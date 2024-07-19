import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LocaleProvider } from '@arcblock/ux/lib/Locale/context';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import HeaderComponent from './components/header';
import { AppProvider } from './components/app-context';

import Home from './pages/home';
import Resume from './pages/resume';

import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';

type DeepStringObject = {
  [key: string]: string | DeepStringObject;
};

type Translations = DeepStringObject;

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
  return (
    <LocaleProvider translations={translations} defaultLocale="en">
      <AppProvider>
        <HeaderComponent />
        <App />
        <ToastContainer position="bottom-right" pauseOnHover={false} autoClose={3000} />
      </AppProvider>
    </LocaleProvider>
  );
}
