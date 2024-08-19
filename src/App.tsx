import './App.css';
import News from './pages/News';
import Favorites from './pages/Favorites';
import Navbar from './components/Navbar';
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
