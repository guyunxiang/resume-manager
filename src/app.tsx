import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/home';
import Resume from './pages/resume';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Resume />} />
      <Route path="/profile/:id" element={<Resume />} />
      <Route path="/profile/new" element={<Resume />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function WrappedApp() {
  // While the blocklet is deploy to a sub path, this will be work properly.
  const basename = window?.blocklet?.prefix || '/';

  return (
    <>
      <Router basename={basename}>
        <App />
      </Router>
      <footer>
        Powered by{' '}
        <a href="http://github.com/guyunxiang" target="_blank" rel="noopener noreferrer">
          guyunxiang
        </a>
      </footer>
      <ToastContainer position="bottom-right" pauseOnHover={false} autoClose={3000} />
    </>
  );
}
