import { useState, useCallback } from 'react'
import {
  handleApiError,
  handle401Error,
  type StandardApiError,
} from '@/lib/api/common'

export const useApiError = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback((err: any) => {
    const apiError = handleApiError(err)
    setError(apiError.message)

    // 401 에러 시 자동 로그아웃
    if (apiError.status === 401) {
      handle401Error()
    }

    return apiError
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const executeAsync = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      onSuccess?: (data: T) => void,
      onError?: (error: StandardApiError) => void,
    ): Promise<T | null> => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await apiCall()

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const apiError = handleError(err)

        if (onError) {
          onError(apiError)
        }

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [handleError],
  )

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeAsync,
    setIsLoading,
  }
}
