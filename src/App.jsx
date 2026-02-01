import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';

function App() {
    return (
        <BrowserRouter>
            <Navigation />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/charts" element={<Charts />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
