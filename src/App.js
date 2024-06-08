import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import RoutesPage from './pages/RoutesPage';
import NavigationPage from './pages/NavigationPage';
import Layout from './components/common/Layout';
import './assets/styles/App.css';

const App = () => (
  <Layout>
    <Routes>
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/routes" element={<RoutesPage />} />
      <Route path="/navigation" element={<NavigationPage />} /> 
      <Route path="/" element={<Navigate to="/projects" />} />
    </Routes>
  </Layout>
);

export default App;
