import { useEffect, useRef } from 'react'

interface AutoSaveOptions {
  data: any
  onSave: (data: any) => void
  interval?: number
  enabled?: boolean
}

export function useAutoSave({ 
  data, 
  onSave, 
  interval = 30000, 
  enabled = true 
}: AutoSaveOptions) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      onSave(data)
    }, interval)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [data, onSave, interval, enabled])

  const saveNow = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    onSave(data)
  }

  return { saveNow }
}