import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api.js';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch { /* handled by interceptor */ }
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = async (data) => {
    const res = await api.post('/projects', data);
    setProjects(prev => [...prev, res.data]);
    return res.data;
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, loadProjects, createProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within ProjectProvider');
  return context;
};
