import { createContext, useContext, useState, useEffect } from 'react'
import { API } from '../services/api'
import { useToast } from './ToastContext'

const WorkspaceContext = createContext(null)

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    localStorage.getItem('activeWorkspaceId') || null
  )
  const { showToast } = useToast()

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const data = await API.getWorkspaces()
        setWorkspaces(data)
        if (data.length > 0 && !activeWorkspaceId) {
          changeWorkspace(data[0].id)
        }
      } catch (e) {
        console.error("Failed to load workspaces", e)
      }
    }
    loadWorkspaces()
  }, [])

  const changeWorkspace = (id) => {
    setActiveWorkspaceId(id)
    localStorage.setItem('activeWorkspaceId', id.toString())
  }

  const createWorkspace = async (name) => {
    try {
      const newWs = await API.createWorkspace(name)
      setWorkspaces([...workspaces, newWs])
      changeWorkspace(newWs.id)
      showToast('success', `Workspace "${name}" created.`)
      return newWs
    } catch (e) {
      showToast('error', 'Failed to create workspace')
      throw e
    }
  }

  const activeWorkspace = workspaces.find(w => w.id.toString() === activeWorkspaceId?.toString())

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, activeWorkspaceId, changeWorkspace, createWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
