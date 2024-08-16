import './App.css';
import News from './News';
import Favorites from './Favorites';
import Navbar from './Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <>
      <Router>
        <Navbar />
          <Routes>
            <Route path='/' element={<News />} />
            <Route path='/favorites' element={<Favorites />} />
          </Routes>
      </Router>
    </>
  );
}

export default App;
