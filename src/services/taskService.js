import { STORAGE } from '../config/systemConfig'
import { readStoredArray, writeStoredValue } from '../lib/storage'
import { fetchActions, createAction, updateActionDone } from './api/actionsApi'

export const TASK_STATUSES = ['New', 'In Progress', 'Waiting', 'Completed', 'Archived']
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export function loadTasks() {
  return readStoredArray(STORAGE.actionItems, [])
}

export async function syncTasksFromBackend() {
  try {
    const actions = await fetchActions()
    if (actions.length) {
      const normalized = actions.map(a => ({
        ...a,
        status: a.done ? 'Completed' : (a.status || 'New'),
        priority: a.priority || 'Medium',
        comments: a.comments || []
      }))
      writeStoredValue(STORAGE.actionItems, normalized)
      return normalized
    }
  } catch {
    // backend unavailable
  }
  return loadTasks()
}

export function saveTask(task) {
  const tasks = loadTasks()
  const nextTask = {
    id: task.id || `task-${Date.now()}`,
    status: task.status || 'New',
    priority: task.priority || 'Medium',
    comments: task.comments || [],
    done: task.done ?? task.status === 'Completed',
    created_at: task.created_at || new Date().toISOString(),
    ...task
  }
  const nextTasks = [nextTask, ...tasks.filter(item => item.id !== nextTask.id)]
  writeStoredValue(STORAGE.actionItems, nextTasks)

  // fire-and-forget — localStorage is the source of truth for UI
  createAction(nextTask).catch(() => {})

  return { task: nextTask, tasks: nextTasks }
}

export function updateTaskStatus(tasks, taskId, status, updatedBy = 'Manager') {
  const nextTasks = tasks.map(task => task.id === taskId
    ? { ...task, status, done: status === 'Completed', updatedBy, updated_at: new Date().toISOString() }
    : task)
  writeStoredValue(STORAGE.actionItems, nextTasks)

  // fire-and-forget backend sync
  updateActionDone(taskId, status === 'Completed').catch(() => {})

  return nextTasks
}
