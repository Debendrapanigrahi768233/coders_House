
import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './Pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Register from './Pages/Register/Register';
import Login from './Pages/Login/Login';


function App() {
  return (
    <BrowserRouter>
    <Navigation/>
    <Routes>
      <Route path="/" element={<Home/>} exact/>
      <Route path="/register" element={<Register/>} exact/>
      <Route path="/login" element={<Login/>} exact/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
