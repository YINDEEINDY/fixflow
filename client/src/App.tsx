import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequestProvider } from './context/RequestContext';
import { AuthProvider } from './context/AuthContext';
import { RequesterPage } from './pages/RequesterPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RequestProvider>
          <Routes>
            <Route path="/" element={<RequesterPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </RequestProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
