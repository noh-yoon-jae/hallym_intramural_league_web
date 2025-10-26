"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(initialValue)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const readValue = () => {
            try {
                const item = window.localStorage.getItem(key)
                if (item) {
                    setStoredValue(JSON.parse(item))
                }
                setIsReady(true)
            } catch (error) {
                console.error(`Error reading localStorage key "${key}":`, error)
                setIsReady(true)
            }
        }

        readValue()

        const handleChange = () => readValue()
        window.addEventListener("local-storage", handleChange)
        window.addEventListener("storage", handleChange)
        return () => {
            window.removeEventListener("local-storage", handleChange)
            window.removeEventListener("storage", handleChange)
        }
    }, [key])

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
            window.dispatchEvent(new Event("local-storage"))
            if (!isReady) {
                setIsReady(true)
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
            setIsReady(true)
        }
    }

    return [storedValue, setValue, isReady] as const
}
