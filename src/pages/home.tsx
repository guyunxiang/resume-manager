import { useState } from 'react';
import { Link } from 'react-router-dom';

import reactLogo from '../assets/react.svg';
import blockletLogo from '../assets/blocklet.svg';
import viteLogo from '../assets/vite.svg';
import plusIcon from '../assets/plus-lg.svg';

import './home.css';

import api from '../libs/api';

function Home() {
  const [count, setCount] = useState(0);

  async function getApiData() {
    const { data } = await api.get('/api/data');
    const { message } = data;
    alert(`Message from api: ${message}`);
  }

  return (
    <div className="home-page container">
      <div className="text-center">
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://www.arcblock.io/docs/blocklet-developer/getting-started" target="_blank" rel="noreferrer">
          <img src={blockletLogo} className="logo blocklet" alt="Blocklet logo" />
        </a>
      </div>
      <h1 className="mb-3">Resume Manager</h1>
      <div className="card">
        <ul className="resume-list">
          <li>
            <Link to="/profile">profile</Link>
          </li>
          <li className="create_new">
            <Link to="/profile/new">
              <img src={plusIcon} alt="add" className="add" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
