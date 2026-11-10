import { use } from 'react'
import { ActivityContext } from './activityContext'

export function useActivity() {
  const context = use(ActivityContext)
  if (!context) throw new Error('useActivity must be used inside ActivityProvider')
  return context
}
