import { useCallback } from 'react'
import { createUser, updateUser, disableUser } from '../services/userService'
import { persistSession } from '../services/authService'

export function useUserManagement({ currentUser, users, setUsers, setCurrentUser, logout, pushNotification }) {
  const handleCreateUser = useCallback(payload => {
    if (!['owner', 'admin'].includes(currentUser?.role)) throw new Error('Only an owner or admin can create users.')
    const result = createUser(users, payload)
    setUsers(result.users)
    pushNotification({
      roles: ['owner', 'admin'],
      title: 'User created',
      body: `${result.user.username} was added as ${result.user.role}.`,
      type: 'user',
      page: 'userManagement'
    })
    return result.user
  }, [currentUser?.role, pushNotification, users])

  const handleUpdateUser = useCallback((username, updates) => {
    if (!['owner', 'admin'].includes(currentUser?.role)) throw new Error('Only an owner or admin can edit users.')
    const result = updateUser(users, username, updates)
    setUsers(result.users)
    if (currentUser?.username === username) {
      const refreshed = {
        username: result.user.username,
        role: result.user.role,
        venue: result.user.venue,
        team: result.user.team,
        canManageCocktails: Boolean(result.user.canManageCocktails || result.user.role === 'admin' || result.user.role === 'bar_manager')
      }
      setCurrentUser(refreshed)
      persistSession(refreshed)
    }
    return result.user
  }, [currentUser, users])

  const handleDisableUser = useCallback(username => {
    if (!['owner', 'admin'].includes(currentUser?.role)) throw new Error('Only an owner or admin can disable users.')
    const result = disableUser(users, username)
    setUsers(result.users)
    if (currentUser?.username === username) logout()
    return result.user
  }, [currentUser?.role, currentUser?.username, users])

  return { handleCreateUser, handleUpdateUser, handleDisableUser }
}
