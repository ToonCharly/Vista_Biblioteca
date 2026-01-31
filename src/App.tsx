import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Libros from './pages/Libros';
import Autores from './pages/Autores';
import Prestamos from './pages/Prestamos';
import Usuarios from './pages/Usuarios';
import LibrosManage from './pages/LibrosManage';
import AutoresManage from './pages/AutoresManage';
import GenerosManage from './pages/GenerosManage';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/libros" element={<Libros />} />
          <Route path="/autores" element={<Autores />} />
          <Route path="/prestamos" element={<Prestamos />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/libros-manage" element={<LibrosManage />} />
          <Route path="/autores-manage" element={<AutoresManage />} />
          <Route path="/generos-manage" element={<GenerosManage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
