import { useEffect, useState } from 'react'

declare global {
  interface Window {
    TossPayments?: any
  }
}

export function useTossPayments() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkTossPayments = () => {
      if (typeof window !== 'undefined' && window.TossPayments) {
        setIsLoaded(true)
        setError(null)
      } else {
        setError('토스 결제 SDK가 로드되지 않았습니다.')
      }
    }

    // 즉시 확인
    checkTossPayments()

    // 주기적으로 확인 (SDK 로드가 늦을 수 있음)
    const interval = setInterval(checkTossPayments, 1000)

    // 10초 후에는 포기
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (!isLoaded) {
        setError('토스 결제 SDK 로드 시간이 초과되었습니다.')
      }
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isLoaded])

  const createTossPayments = (clientKey: string) => {
    if (!isLoaded || !window.TossPayments) {
      throw new Error('토스 결제 SDK가 로드되지 않았습니다.')
    }
    return new window.TossPayments(clientKey)
  }

  return {
    isLoaded,
    error,
    createTossPayments,
  }
}
