import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface UseAppDataOptions<T> {
  key: string
  initialData: T[]
}

export function useAppData<T extends { id: string }>({ key, initialData }: UseAppDataOptions<T>) {
  const [data, setData] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(`cuidado_${key}`)
      return stored ? JSON.parse(stored) : initialData
    } catch {
      return initialData
    }
  })

  useEffect(() => {
    localStorage.setItem(`cuidado_${key}`, JSON.stringify(data))
  }, [data, key])

  const add = useCallback((item: Omit<T, 'id' | 'created_at'>) => {
    const newItem = {
      ...item,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    } as unknown as T
    setData((prev) => [newItem, ...prev])
    return newItem
  }, [])

  const update = useCallback((id: string, updates: Partial<T>) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }, [])

  const remove = useCallback((id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const getById = useCallback(
    (id: string) => data.find((item) => item.id === id),
    [data]
  )

  return { data, setData, add, update, remove, getById }
}
