'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  authApi,
  cashApi,
  notificationApi,
  paymentApi,
  paymentMethodApi,
  productApi,
  reviewApi,
} from '@/lib/api'
import { useState } from 'react'

export default function ApiTestPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [lastRegisteredProductId, setLastRegisteredProductId] = useState<
    number | null
  >(null)
  const [lastCreatedReviewId, setLastCreatedReviewId] = useState<number | null>(
    null,
  )

  const runTest = async (
    testName: string,
    testFunction: () => Promise<any>,
  ) => {
    setIsLoading((prev) => ({ ...prev, [testName]: true }))
    try {
      const result = await testFunction()
      setResults((prev) => ({
        ...prev,
        [testName]: { success: true, data: result },
      }))
    } catch (error: any) {
      console.error(`❌ ${testName} 실패:`, error)
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status,
          fullError: error,
        },
      }))
    } finally {
      setIsLoading((prev) => ({ ...prev, [testName]: false }))
    }
  }

  const tests = [
    // === 필수 테스트 (백엔드 재시작 시 필요) ===
    {
      name: '회원가입 (POST JSON)',
      description: 'POST /api/v1/auth/signup',
      category: '인증',
      test: async () => {
        const response = await authApi.signup({
          email: 'demo@example.com',
          password: 'demo123',
          nickname: '데모',
          phoneNumber: '01012345678',
          address: '서울시 강남구',
        })
        console.log('👤 회원가입 결과:', response)
        return response
      },
    },
    {
      name: '로그인 (POST JSON)',
      description: 'demo@example.com / demo123으로 로그인',
      category: '인증',
      test: async () => {
        const response = await authApi.login('demo@example.com', 'demo123')
        console.log('🔐 로그인 결과:', response)
        return response
      },
    },
    {
      name: '상품 등록 (POST FormData)',
      description: 'POST /api/v1/products with FormData',
      test: async () => {
        // 테스트용 더미 이미지 생성 (더 안전한 방법)
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 200
        const ctx = canvas.getContext('2d')!

        // 배경색 설정
        ctx.fillStyle = '#e0e0e0'
        ctx.fillRect(0, 0, 200, 200)

        // 텍스트 추가
        ctx.fillStyle = '#333333'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('TEST IMAGE', 100, 80)
        ctx.fillText('API TEST', 100, 120)

        // 간단한 도형 추가
        ctx.fillStyle = '#4CAF50'
        ctx.fillRect(50, 140, 100, 40)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '12px Arial'
        ctx.fillText('SUCCESS', 100, 160)

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > 0) {
                resolve(blob)
              } else {
                reject(new Error('Canvas blob 생성 실패 또는 빈 파일'))
              }
            },
            'image/png',
            0.9,
          ) // 품질 설정
        })

        const file = new File([blob], 'test-image.png', { type: 'image/png' })

        console.log('🖼️ 생성된 더미 이미지:', {
          name: file.name,
          size: file.size,
          type: file.type,
          isValid: file.size > 0,
        })

        if (file.size === 0) {
          throw new Error('생성된 이미지 파일이 비어있습니다')
        }

        // 미래 시간으로 경매 시작 시간 설정 (수정 가능한 상태로 만들기)
        const futureTime = new Date()
        futureTime.setDate(futureTime.getDate() + 30) // 30일 후
        const auctionStartTime = futureTime.toISOString().slice(0, 19) // YYYY-MM-DDTHH:mm:ss 형식

        const response = await productApi.createProduct(
          {
            name: '아이폰 15 Pro 256GB',
            description: '미개봉 새 제품입니다.',
            categoryId: 1,
            initialPrice: 1000000,
            auctionStartTime: auctionStartTime,
            auctionDuration: '24시간',
            deliveryMethod: 'TRADE',
            location: '서울 강남구',
          },
          [file],
          'AUCTION', // 상품 타입: 경매 상품
        )
        console.log('📦 상품 등록 결과:', response)

        // 상품 등록 성공 시 상품 ID 저장
        if (response.success && response.data?.productId) {
          setLastRegisteredProductId(response.data.productId)
          console.log(`📦 등록된 상품 ID 저장: ${response.data.productId}`)
        }

        return response
      },
    },

    // === 성공한 결제수단 CRUD 테스트들 (주석 처리) ===
    /*
    {
      name: '결제수단 목록 조회 (GET)',
      description: 'GET /api/v1/paymentMethods',
      category: '결제수단',
      test: async () => {
        const response = await paymentMethodApi.getPaymentMethods()
        console.log('💳 결제수단 목록:', response)
        return response
      },
    },
    {
      name: '카드 결제수단 등록 (POST)',
      description: 'POST /api/v1/paymentMethods (카드)',
      category: '결제수단',
      test: async () => {
        const response = await paymentMethodApi.createPaymentMethod({
          type: 'card',
          token: 'test_card_token_12345',
          alias: '내 신용카드',
          isDefault: true,
          brand: 'VISA',
          last4: '1234',
          expMonth: 12,
          expYear: 2025,
          provider: 'toss',
        })
        console.log('💳 카드 결제수단 등록:', response)
        return response
      },
    },
    {
      name: '계좌 결제수단 등록 (POST)',
      description: 'POST /api/v1/paymentMethods (계좌)',
      category: '결제수단',
      test: async () => {
        const response = await paymentMethodApi.createPaymentMethod({
          type: 'bank',
          token: 'test_bank_token_67890',
          alias: '내 계좌',
          isDefault: false,
          bankCode: '004',
          bankName: '국민은행',
          acctLast4: '5678',
          provider: 'toss',
        })
        console.log('💳 계좌 결제수단 등록:', response)
        return response
      },
    },
    */
    // === 성공한 테스트들 (주석 처리) ===
    /*
    {
      name: '입찰 생성 (POST JSON)',
      description: 'POST /api/v1/bids/products/1 (실제 존재하는 상품)',
      test: async () => {
        const bidAmount = 1500000
        const response = await bidApi.createBid(1, bidAmount)
        console.log('💰 입찰 생성:', response)
        return response
      },
    },
    {
      name: '입찰 현황 조회 (GET)',
      description: 'GET /api/v1/bids/products/1 (입찰 생성 후 조회)',
      test: async () => {
        const response = await bidApi.getBidStatus(1)
        console.log('🔍 입찰 현황:', response)
        return response
      },
    },
    {
      name: '내 입찰 내역 조회 (GET)',
      description: 'GET /api/v1/bids/me',
      test: async () => {
        const response = await bidApi.getMyBids()
        console.log('📋 내 입찰 내역:', response)
        return response
      },
    },
    {
      name: '로그인 확인 (GET)',
      description: 'GET /api/v1/auth/check',
      test: async () => {
        const response = await authApi.checkLogin()
        console.log('🔍 로그인 확인:', response)
        return response
      },
    },
    {
      name: '내 정보 조회 (GET)',
      description: 'GET /api/v1/members/me',
      test: async () => {
        const response = await authApi.getMyInfo()
        console.log('👤 내 정보:', response)
        return response
      },
    },
    {
      name: '남의 정보 조회 (GET)',
      description: 'GET /api/v1/members/3 (판매자 정보)',
      test: async () => {
        const response = await authApi.getMemberInfo(3)
        console.log('👥 남의 정보 (판매자):', response)
        return response
      },
    },
    {
      name: '내 정보 수정 (PUT)',
      description: 'PUT /api/v1/members/me (multipart/form-data)',
      test: async () => {
        const response = await authApi.updateProfile({
          nickname: '수정된닉네임',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        })
        console.log('✏️ 내 정보 수정:', response)
        return response
      },
    },
    {
      name: '상품 목록 조회 (GET)',
      description: 'GET /api/v1/products',
      test: async () => {
        const response = await productApi.getProducts()
        console.log('📦 상품 목록:', response)
        return response
      },
    },
    {
      name: '상품 상세 조회 (GET)',
      description: 'GET /api/v1/products/1 (실제 존재하는 상품)',
      test: async () => {
        const response = await productApi.getProduct(1)
        console.log('📦 상품 상세:', response)
        return response
      },
    },
    {
      name: '내 상품 목록 조회 (GET)',
      description: 'GET /api/v1/products/me',
      test: async () => {
        const response = await productApi.getMyProducts()
        console.log('📦 내 상품 목록:', response)
        return response
      },
    },
    {
      name: '특정 회원 상품 목록 조회 (GET)',
      description: 'GET /api/v1/products/members/3',
      test: async () => {
        const response = await productApi.getProductsByMember(3)
        console.log('📦 특정 회원 상품 목록:', response)
        return response
      },
    },
    */
    // === 성공한 테스트들 (주석 처리) ===
    /*
    {
      name: '상품 수정 (PUT)',
      description: 'PUT /api/v1/products/{새로등록한상품ID} (방금 등록한 상품)',
      test: async () => {
        // 먼저 내 상품 목록을 조회해서 방금 등록한 상품 ID를 가져옴
        const myProductsResponse = await productApi.getMyProducts()
        console.log('📦 내 상품 목록 (수정용):', myProductsResponse)
        console.log('📦 내 상품 목록 상세:', {
          success: myProductsResponse.success,
          hasData: !!myProductsResponse.data,
          dataType: typeof myProductsResponse.data,
          dataLength: myProductsResponse.data?.length,
          firstItem: myProductsResponse.data?.[0],
        })

        if (!myProductsResponse.success) {
          return {
            success: false,
            msg: `내 상품 목록 조회 실패: ${myProductsResponse.msg}`,
          }
        }

        if (!myProductsResponse.data) {
          return {
            success: false,
            msg: '내 상품 목록 데이터가 없습니다.',
          }
        }

        // 데이터 구조 확인 및 처리
        let products = []

        if (Array.isArray(myProductsResponse.data)) {
          products = myProductsResponse.data
        } else if (
          myProductsResponse.data &&
          typeof myProductsResponse.data === 'object'
        ) {
          // 객체인 경우 content 배열이나 다른 필드에서 상품 목록 찾기
          if (
            myProductsResponse.data.content &&
            Array.isArray(myProductsResponse.data.content)
          ) {
            products = myProductsResponse.data.content
          } else if (
            myProductsResponse.data.products &&
            Array.isArray(myProductsResponse.data.products)
          ) {
            products = myProductsResponse.data.products
          } else {
            // 객체의 값들을 배열로 변환 시도
            products = Object.values(myProductsResponse.data).filter(
              (item) => item && typeof item === 'object' && (item as any).id,
            )
          }
        }

        console.log('📦 처리된 상품 목록:', products)

        if (products.length === 0) {
          // 상품이 없으면 저장된 상품 ID를 사용
          console.log(
            '📦 내 상품 목록이 비어있음. 저장된 상품 ID를 사용합니다.',
          )

          // 저장된 상품 ID 사용 (상품 등록 후 저장된 ID)
          let productId = lastRegisteredProductId || 21 // 저장된 ID 또는 기본값

          // 저장된 ID가 없으면 최근 등록된 상품을 찾아서 사용
          if (!lastRegisteredProductId) {
            console.log(
              '📦 저장된 상품 ID가 없음. 최근 등록된 상품을 찾습니다.',
            )

            // 현재 사용자 정보 조회
            const myInfoResponse = await authApi.getMyInfo()
            if (myInfoResponse.success && myInfoResponse.data) {
              const currentUserId = myInfoResponse.data.id

              // 전체 상품 목록에서 내가 등록한 상품 찾기
              const allProductsResponse = await productApi.getProducts()
              if (
                allProductsResponse.success &&
                allProductsResponse.data?.content
              ) {
                const myProducts = allProductsResponse.data.content.filter(
                  (product: any) => product.seller?.id === currentUserId,
                )

                if (myProducts.length > 0) {
                  productId = myProducts[0].productId
                  console.log(`📦 찾은 내 상품 ID: ${productId}`)
                }
              }
            }
          }

          console.log(
            `📦 사용할 상품 ID: ${productId} (저장된 ID: ${lastRegisteredProductId})`,
          )

          // 미래 시간으로 경매 시작 시간 설정 (수정 가능한 상태로 만들기)
          const futureTime = new Date()
          futureTime.setDate(futureTime.getDate() + 30) // 30일 후
          const auctionStartTime = futureTime.toISOString().slice(0, 19) // YYYY-MM-DDTHH:mm:ss 형식

          const response = await productApi.updateProduct(productId, {
            name: '수정된 iPhone 15 Pro',
            description: '수정된 설명입니다.',
            initialPrice: 1200000,
            auctionStartTime: auctionStartTime,
          })
          console.log('✏️ 상품 수정 (저장된 ID 사용):', response)
          return response
        }

        // 가장 최근에 등록한 상품 (첫 번째 상품)
        const latestProduct = products[0]

        if (!latestProduct || !latestProduct.id) {
          return {
            success: false,
            msg: `상품 데이터가 올바르지 않습니다: ${JSON.stringify(latestProduct)}`,
          }
        }

        const productId = latestProduct.id
        console.log(`📦 상품 수정 대상 ID: ${productId}`)

        // 미래 시간으로 경매 시작 시간 설정 (수정 가능한 상태로 만들기)
        const futureTime = new Date()
        futureTime.setDate(futureTime.getDate() + 30) // 30일 후
        const auctionStartTime = futureTime.toISOString().slice(0, 19) // YYYY-MM-DDTHH:mm:ss 형식

        const response = await productApi.updateProduct(productId, {
          name: '수정된 iPhone 15 Pro',
          description: '수정된 설명입니다.',
          initialPrice: 1200000,
          auctionStartTime: auctionStartTime,
        })
        console.log('✏️ 상품 수정:', response)
        return response
      },
    },
    {
      name: '상품 삭제 (DELETE)',
      description:
        'DELETE /api/v1/products/{새로등록한상품ID} (주의: 실제 삭제됩니다!)',
      test: async () => {
        // 먼저 내 상품 목록을 조회해서 방금 등록한 상품 ID를 가져옴
        const myProductsResponse = await productApi.getMyProducts()
        console.log('📦 내 상품 목록 (삭제용):', myProductsResponse)
        console.log('📦 내 상품 목록 상세:', {
          success: myProductsResponse.success,
          hasData: !!myProductsResponse.data,
          dataType: typeof myProductsResponse.data,
          dataLength: myProductsResponse.data?.length,
          firstItem: myProductsResponse.data?.[0],
        })

        if (!myProductsResponse.success) {
          return {
            success: false,
            msg: `내 상품 목록 조회 실패: ${myProductsResponse.msg}`,
          }
        }

        if (!myProductsResponse.data) {
          return {
            success: false,
            msg: '내 상품 목록 데이터가 없습니다.',
          }
        }

        // 데이터 구조 확인 및 처리
        let products = []

        if (Array.isArray(myProductsResponse.data)) {
          products = myProductsResponse.data
        } else if (
          myProductsResponse.data &&
          typeof myProductsResponse.data === 'object'
        ) {
          // 객체인 경우 content 배열이나 다른 필드에서 상품 목록 찾기
          if (
            myProductsResponse.data.content &&
            Array.isArray(myProductsResponse.data.content)
          ) {
            products = myProductsResponse.data.content
          } else if (
            myProductsResponse.data.products &&
            Array.isArray(myProductsResponse.data.products)
          ) {
            products = myProductsResponse.data.products
          } else {
            // 객체의 값들을 배열로 변환 시도
            products = Object.values(myProductsResponse.data).filter(
              (item) => item && typeof item === 'object' && (item as any).id,
            )
          }
        }

        console.log('📦 처리된 상품 목록:', products)

        if (products.length === 0) {
          // 상품이 없으면 저장된 상품 ID를 사용
          console.log(
            '📦 내 상품 목록이 비어있음. 저장된 상품 ID를 사용합니다.',
          )

          // 저장된 상품 ID 사용 (상품 등록 후 저장된 ID)
          let productId = lastRegisteredProductId || 21 // 저장된 ID 또는 기본값

          // 저장된 ID가 없으면 최근 등록된 상품을 찾아서 사용
          if (!lastRegisteredProductId) {
            console.log(
              '📦 저장된 상품 ID가 없음. 최근 등록된 상품을 찾습니다.',
            )

            // 현재  조회
            const myInfoResponse = await authApi.getMyInfo()
            if (myInfoResponse.success && myInfoResponse.data) {
              const currentUserId = myInfoResponse.data.id

              // 전체 상품 목록에서 내가 등록한 상품 찾기
              const allProductsResponse = await productApi.getProducts()
              if (
                allProductsResponse.success &&
                allProductsResponse.data?.content
              ) {
                const myProducts = allProductsResponse.data.content.filter(
                  (product: any) => product.seller?.id === currentUserId,
                )

                if (myProducts.length > 0) {
                  productId = myProducts[0].productId
                  console.log(`📦 찾은 내 상품 ID: ${productId}`)
                }
              }
            }
          }

          console.log(
            `📦 사용할 상품 ID: ${productId} (저장된 ID: ${lastRegisteredProductId})`,
          )

          const response = await productApi.deleteProduct(productId)
          console.log('🗑️ 상품 삭제 (저장된 ID 사용):', response)
          return response
        }

        // 가장 최근에 등록한 상품 (첫 번째 상품)
        const latestProduct = products[0]

        if (!latestProduct || !latestProduct.id) {
          return {
            success: false,
            msg: `상품 데이터가 올바르지 않습니다: ${JSON.stringify(latestProduct)}`,
          }
        }

        const productId = latestProduct.id
        console.log(`📦 상품 삭제 대상 ID: ${productId}`)

        const response = await productApi.deleteProduct(productId)
        console.log('🗑️ 상품 삭제:', response)
        return response
      },
    },
    {
      name: '회원 탈퇴 (DELETE)',
      description: 'DELETE /api/v1/members/me (주의: 실제 탈퇴됩니다!)',
      test: async () => {
        const response = await authApi.deleteProfile()
        console.log('🚪 회원 탈퇴:', response)
        return response
      },
    },
    */

    // === 성공한 결제수단 CRUD 테스트들 (주석 처리) ===
    /*
    {
      name: '결제수단 단건 조회 (GET)',
      description: 'GET /api/v1/paymentMethods/{id}',
      category: '결제수단',
      test: async () => {
        // 먼저 결제수단 목록을 조회해서 ID를 가져옴
        const listResponse = await paymentMethodApi.getPaymentMethods()
        console.log('💳 결제수단 목록 응답 구조:', listResponse)

        // data가 직접 배열인지 확인
        let paymentMethods = []
        if (Array.isArray(listResponse.data)) {
          paymentMethods = listResponse.data
        } else if (
          listResponse.data?.content &&
          Array.isArray(listResponse.data.content)
        ) {
          paymentMethods = listResponse.data.content
        }

        if (paymentMethods.length > 0) {
          const paymentMethodId = paymentMethods[0].id
          console.log(`💳 조회할 결제수단 ID: ${paymentMethodId}`)
          const response =
            await paymentMethodApi.getPaymentMethod(paymentMethodId)
          console.log('💳 결제수단 단건 조회:', response)
          return response
        } else {
          throw new Error('조회할 결제수단이 없습니다')
        }
      },
    },
    {
      name: '결제수단 수정 (PUT)',
      description: 'PUT /api/v1/paymentMethods/{id}',
      category: '결제수단',
      test: async () => {
        // 먼저 결제수단 목록을 조회해서 ID를 가져옴
        const listResponse = await paymentMethodApi.getPaymentMethods()
        console.log('💳 결제수단 목록 응답 구조 (수정용):', listResponse)

        // data가 직접 배열인지 확인
        let paymentMethods = []
        if (Array.isArray(listResponse.data)) {
          paymentMethods = listResponse.data
        } else if (
          listResponse.data?.content &&
          Array.isArray(listResponse.data.content)
        ) {
          paymentMethods = listResponse.data.content
        }

        if (paymentMethods.length > 0) {
          const paymentMethodId = paymentMethods[0].id
          console.log(`💳 수정할 결제수단 ID: ${paymentMethodId}`)
          const response = await paymentMethodApi.updatePaymentMethod(
            paymentMethodId,
            {
              alias: '수정된 결제수단',
              isDefault: false,
            },
          )
          console.log('💳 결제수단 수정:', response)
          return response
        } else {
          throw new Error('수정할 결제수단이 없습니다')
        }
      },
    },
    {
      name: '결제수단 삭제 (DELETE)',
      description: 'DELETE /api/v1/paymentMethods/{id}',
      category: '결제수단',
      test: async () => {
        // 먼저 결제수단 목록을 조회해서 ID를 가져옴
        const listResponse = await paymentMethodApi.getPaymentMethods()
        console.log('💳 결제수단 목록 응답 구조 (삭제용):', listResponse)

        // data가 직접 배열인지 확인
        let paymentMethods = []
        if (Array.isArray(listResponse.data)) {
          paymentMethods = listResponse.data
        } else if (
          listResponse.data?.content &&
          Array.isArray(listResponse.data.content)
        ) {
          paymentMethods = listResponse.data.content
        }

        if (paymentMethods.length > 0) {
          const paymentMethodId = paymentMethods[0].id
          console.log(`💳 삭제할 결제수단 ID: ${paymentMethodId}`)
          const response =
            await paymentMethodApi.deletePaymentMethod(paymentMethodId)
          console.log('💳 결제수단 삭제:', response)
          return response
        } else {
          throw new Error('삭제할 결제수단이 없습니다')
        }
      },
    },
    */

    // === 결제 및 지갑 전체 플로우 테스트 ===
    {
      name: '토스 빌링키 발급 (POST)',
      description: 'POST /api/v1/payments/toss/issue-billing-key',
      category: '결제',
      test: async () => {
        const response = await paymentApi.issueBillingKey({
          authKey: 'test_auth_key_12345', // 테스트용 authKey
        })
        console.log('🔑 토스 빌링키 발급:', response)
        return response
      },
    },
    {
      name: '결제수단 등록 (POST)',
      description: 'POST /api/v1/paymentMethods',
      category: '결제',
      test: async () => {
        // 고유한 별명 생성 (중복 방지)
        const uniqueAlias = `테스트 카드 ${Date.now()}`

        const response = await paymentMethodApi.createPaymentMethod({
          type: 'card',
          token: 'test_billing_key_67890', // 위에서 발급받은 빌링키
          alias: uniqueAlias,
          isDefault: true,
          brand: 'VISA',
          last4: '1234',
          expMonth: 12,
          expYear: 2025,
          provider: 'toss',
        })
        console.log('💳 결제수단 등록:', response)
        return response
      },
    },
    {
      name: '지갑 충전 (POST)',
      description: 'POST /api/v1/payments',
      category: '결제',
      test: async () => {
        // 먼저 결제수단 목록을 조회해서 ID를 가져옴
        const listResponse = await paymentMethodApi.getPaymentMethods()
        console.log('💰 결제수단 목록 응답 구조 (충전용):', listResponse)

        // data가 직접 배열인지 확인
        let paymentMethods = []
        if (Array.isArray(listResponse.data)) {
          paymentMethods = listResponse.data
        } else if (
          listResponse.data?.content &&
          Array.isArray(listResponse.data.content)
        ) {
          paymentMethods = listResponse.data.content
        }

        if (paymentMethods.length > 0) {
          const paymentMethodId = paymentMethods[0].id
          console.log(`💰 충전에 사용할 결제수단 ID: ${paymentMethodId}`)
          const response = await paymentApi.charge({
            paymentMethodId: paymentMethodId,
            amount: 50000, // 5만원 충전
            idempotencyKey: `charge_${Date.now()}`, // 중복 방지 키
          })
          console.log('💰 지갑 충전:', response)
          return response
        } else {
          throw new Error('충전에 사용할 결제수단이 없습니다')
        }
      },
    },
    {
      name: '토큰 상태 확인 (DEBUG)',
      description: '현재 토큰 상태 확인',
      category: '디버그',
      test: async () => {
        console.log('🔍 토큰 상태 확인 시작')
        console.log('🍪 현재 쿠키:', document.cookie)
        console.log(
          '📱 localStorage 토큰:',
          localStorage.getItem('accessToken'),
        )

        // 쿠키에서 accessToken 추출
        const cookies = document.cookie.split(';')
        const accessTokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('accessToken='),
        )
        const cookieToken = accessTokenCookie?.split('=')[1]

        console.log('🔑 쿠키에서 추출한 토큰:', cookieToken ? '존재' : '없음')
        console.log('🔑 토큰 길이:', cookieToken?.length || 0)

        return {
          success: true,
          data: {
            cookie: cookieToken ? '존재' : '없음',
            localStorage: localStorage.getItem('accessToken') ? '존재' : '없음',
            tokenLength: cookieToken?.length || 0,
          },
        }
      },
    },
    {
      name: '직접 fetch 테스트 (DEBUG)',
      description: 'apiClient 대신 직접 fetch로 테스트',
      category: '디버그',
      test: async () => {
        console.log('🔍 직접 fetch 테스트 시작')

        // 쿠키에서 토큰 추출
        const cookies = document.cookie.split(';')
        const accessTokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('accessToken='),
        )
        const token = accessTokenCookie?.split('=')[1]

        console.log('🔑 사용할 토큰:', token ? '존재' : '없음')

        if (!token) {
          throw new Error('토큰이 없습니다')
        }

        // 직접 fetch로 요청
        const response = await fetch('/api/proxy/api/v1/cash', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        console.log('📡 fetch 응답 상태:', response.status)
        console.log(
          '📡 fetch 응답 헤더:',
          Object.fromEntries(response.headers.entries()),
        )

        const data = await response.json()
        console.log('📡 fetch 응답 데이터:', data)

        return {
          success: response.ok,
          data: data,
          status: response.status,
        }
      },
    },
    {
      name: '지갑 잔액 조회 (GET)',
      description: 'GET /api/v1/cash',
      category: '캐시',
      test: async () => {
        console.log('🔍 테스트 시작 - 지갑 잔액 조회')
        console.log('🍪 현재 쿠키:', document.cookie)
        console.log(
          '📱 localStorage 토큰:',
          localStorage.getItem('accessToken'),
        )

        const response = await cashApi.getMyCash()
        console.log('💵 지갑 잔액 조회 응답:', response)
        return response
      },
    },
    {
      name: '지갑 거래 내역 조회 (GET)',
      description: 'GET /api/v1/cash/transactions?page=1&size=20',
      category: '캐시',
      test: async () => {
        const response = await cashApi.getMyTransactions({ page: 1, size: 20 })
        console.log('💵 지갑 거래 내역 조회:', response)
        return response
      },
    },
    {
      name: '지갑 거래 상세 조회 (GET)',
      description: 'GET /api/v1/cash/transactions/{id}',
      category: '캐시',
      test: async () => {
        // 먼저 거래 내역을 조회해서 실제 존재하는 거래 ID를 찾음
        const listResponse = await cashApi.getMyTransactions({
          page: 1,
          size: 20,
        })
        console.log('💵 거래 내역 응답 구조 (상세 조회용):', listResponse)

        // data.items 배열에서 첫 번째 거래의 ID 사용
        let transactionId = null
        if (
          listResponse.success &&
          listResponse.data?.items &&
          Array.isArray(listResponse.data.items) &&
          listResponse.data.items.length > 0
        ) {
          transactionId = listResponse.data.items[0].id
        } else {
          throw new Error(
            '조회할 거래 내역이 없습니다. 먼저 충전을 완료해주세요.',
          )
        }

        console.log(`💵 조회할 거래 ID: ${transactionId}`)
        const response = await cashApi.getMyTransactionDetail(transactionId)
        console.log('💵 지갑 거래 상세 조회:', response)
        return response
      },
    },

    // === 결제 API 테스트 (백엔드 미구현으로 주석 처리) ===
    /*
    {
      name: '결제(충전) 요청 (POST)',
      description: 'POST /api/v1/payments',
      category: '결제',
      test: async () => {
        // 먼저 결제수단 목록을 조회해서 ID를 가져옴
        const listResponse = await paymentMethodApi.getPaymentMethods()
        console.log('💰 결제수단 목록 응답 구조 (결제용):', listResponse)

        // data가 직접 배열인지 확인
        let paymentMethods = []
        if (Array.isArray(listResponse.data)) {
          paymentMethods = listResponse.data
        } else if (
          listResponse.data?.content &&
          Array.isArray(listResponse.data.content)
        ) {
          paymentMethods = listResponse.data.content
        }

        if (paymentMethods.length > 0) {
          const paymentMethodId = paymentMethods[0].id
          console.log(`💰 결제에 사용할 결제수단 ID: ${paymentMethodId}`)
          const response = await paymentApi.charge({
            paymentMethodId: paymentMethodId,
            amount: 100000, // 10만원 결제
            idempotencyKey: `payment_${Date.now()}`, // 중복 방지 키
          })
          console.log('💰 결제(충전) 요청:', response)
          return response
        } else {
          throw new Error('결제에 사용할 결제수단이 없습니다')
        }
      },
    },
    {
      name: '내 결제 내역 조회 (GET)',
      description: 'GET /api/v1/payments/me',
      category: '결제',
      test: async () => {
        const response = await paymentApi.getMyPayments()
        console.log('💰 내 결제 내역 조회:', response)
        return response
      },
    },
    {
      name: '내 결제 단건 상세 조회 (GET)',
      description: 'GET /api/v1/payments/me/{paymentId}',
      category: '결제',
      test: async () => {
        // 먼저 결제 내역을 조회해서 ID를 가져옴
        const listResponse = await paymentApi.getMyPayments()
        console.log('💰 결제 내역 응답 구조 (상세 조회용):', listResponse)

        // data가 직접 배열인지 확인
        let payments = []
        if (Array.isArray(listResponse.data)) {
          payments = listResponse.data
        } else if (
          listResponse.data?.content &&
          Array.isArray(listResponse.data.content)
        ) {
          payments = listResponse.data.content
        }

        if (payments.length > 0) {
          const paymentId = payments[0].id
          console.log(`💰 조회할 결제 ID: ${paymentId}`)
          const response = await paymentApi.getMyPaymentDetail(paymentId)
          console.log('💰 내 결제 단건 상세 조회:', response)
          return response
        } else {
          throw new Error('조회할 결제 내역이 없습니다')
        }
      },
    },
    */

    // === 알림 API 테스트 ===
    {
      name: '알림 목록 조회 (GET)',
      description: 'GET /notifications',
      category: '알림',
      test: async () => {
        const response = await notificationApi.getNotifications({
          page: 1,
          size: 10,
        })
        console.log('🔔 알림 목록 조회:', response)
        return response
      },
    },
    {
      name: '읽지 않은 알림 개수 조회 (GET)',
      description: 'GET /notifications/unread-count',
      category: '알림',
      test: async () => {
        const response = await notificationApi.getUnreadCount()
        console.log('🔔 읽지 않은 알림 개수 조회:', response)
        return response
      },
    },
    {
      name: '모든 알림 읽음 처리 (PUT)',
      description: 'PUT /notifications/read-all',
      category: '알림',
      test: async () => {
        const response = await notificationApi.markAllAsRead()
        console.log('🔔 모든 알림 읽음 처리:', response)
        return response
      },
    },
    {
      name: '특정 알림 읽음 처리 (PUT)',
      description: 'PUT /notifications/{id}/read',
      category: '알림',
      test: async () => {
        // 먼저 알림 목록을 조회해서 실제 존재하는 알림 ID를 찾음
        const listResponse = await notificationApi.getNotifications({
          page: 1,
          size: 10,
        })
        console.log('🔔 알림 목록 응답 구조 (읽음 처리용):', listResponse)

        let notificationId = null
        if (
          listResponse.success &&
          listResponse.data?.content &&
          Array.isArray(listResponse.data.content) &&
          listResponse.data.content.length > 0
        ) {
          notificationId = listResponse.data.content[0].id
        } else {
          throw new Error(
            '읽음 처리할 알림이 없습니다. 먼저 알림을 생성해주세요.',
          )
        }

        console.log(`🔔 읽음 처리할 알림 ID: ${notificationId}`)
        const response = await notificationApi.markAsRead(notificationId)
        console.log('🔔 특정 알림 읽음 처리:', response)
        return response
      },
    },

    // === 리뷰 API 테스트 ===
    {
      name: '리뷰 작성 (POST)',
      description: 'POST /api/v1/reviews',
      category: '리뷰',
      test: async () => {
        const response = await reviewApi.createReview({
          productId: 2, // 실제 존재하는 상품 ID
          comment:
            'MacBook Pro M3 정말 좋네요! 성능도 훌륭하고 배송도 빠르게 왔습니다.',
          isSatisfied: true,
        })
        console.log('⭐ 리뷰 작성:', response)

        // 리뷰 작성 성공 시 reviewId 저장
        if (response.success && response.data?.reviewId) {
          setLastCreatedReviewId(response.data.reviewId)
          console.log(`⭐ 저장된 리뷰 ID: ${response.data.reviewId}`)
        }

        return response
      },
    },
    {
      name: '리뷰 조회 (GET)',
      description: 'GET /api/v1/reviews/{id}',
      category: '리뷰',
      test: async () => {
        // 저장된 리뷰 ID가 있으면 사용, 없으면 기본값 2 사용
        const reviewId = lastCreatedReviewId || 2
        console.log(`⭐ 조회할 리뷰 ID: ${reviewId}`)

        const response = await reviewApi.getReview(reviewId)
        console.log('⭐ 리뷰 조회:', response)
        return response
      },
    },
    {
      name: '리뷰 수정 (PUT)',
      description: 'PUT /api/v1/reviews/{id}',
      category: '리뷰',
      test: async () => {
        // 저장된 리뷰 ID가 있으면 사용, 없으면 기본값 2 사용
        const reviewId = lastCreatedReviewId || 2
        console.log(`⭐ 수정할 리뷰 ID: ${reviewId}`)

        const response = await reviewApi.updateReview(reviewId, {
          comment: '수정된 리뷰 내용입니다. 정말 만족스러운 구매였어요!',
          isSatisfied: true,
        })
        console.log('⭐ 리뷰 수정:', response)
        return response
      },
    },
    {
      name: '리뷰 삭제 (DELETE)',
      description: 'DELETE /api/v1/reviews/{id}',
      category: '리뷰',
      test: async () => {
        // 저장된 리뷰 ID가 있으면 사용, 없으면 기본값 2 사용
        const reviewId = lastCreatedReviewId || 2
        console.log(`⭐ 삭제할 리뷰 ID: ${reviewId}`)

        const response = await reviewApi.deleteReview(reviewId)
        console.log('⭐ 리뷰 삭제:', response)
        return response
      },
    },
  ]

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">API 테스트 페이지</h1>

      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <h2 className="mb-2 text-lg font-semibold text-blue-800">
          테스트 순서 안내
        </h2>
        <ol className="list-inside list-decimal space-y-1 text-sm text-blue-700">
          <li>
            먼저 <strong>회원가입</strong>을 실행하세요 (또는 기존 사용자 사용)
          </li>
          <li>
            그 다음 <strong>로그인</strong>을 실행하세요 (토큰이 저장됩니다)
          </li>
          <li>
            로그인 성공 후 <strong>상품 등록</strong>을 실행하세요
          </li>
          <li>
            <strong>토스 빌링키 발급</strong> → <strong>결제수단 등록</strong> →{' '}
            <strong>지갑 충전</strong>
          </li>
          <li>
            <strong>지갑 잔액 조회</strong> →{' '}
            <strong>지갑 거래 내역 조회</strong> →{' '}
            <strong>지갑 거래 상세 조회</strong>
          </li>
        </ol>
        <div className="mt-2 text-xs text-yellow-600">
          🔑 <strong>로그인 정보:</strong> bidder1@example.com / password123
          사용 (거래 내역이 있는 계정)
        </div>
        <div className="mt-2 text-xs text-red-600">
          ⚠️ <strong>중요:</strong> test2@example.com 계정에는 지갑이 없습니다!
          bidder1@example.com으로 다시 로그인하세요!
        </div>
        <div className="mt-2 text-xs text-blue-600">
          💡 <strong>참고:</strong> 결제 및 지갑 전체 플로우 테스트를
          진행합니다!
        </div>
        <div className="mt-2 text-xs text-green-600">
          🎯 <strong>전체 플로우:</strong> 빌링키 발급 → 결제수단 등록 → 지갑
          충전 → 캐시 조회!
        </div>
        <div className="mt-2 text-xs text-purple-600">
          🔄 <strong>동적 ID 처리:</strong> 결제수단 ID와 거래 ID를 자동으로
          찾아서 사용!
        </div>
        <div className="mt-2 text-xs text-orange-600">
          💰 <strong>지갑 생성:</strong> 첫 충전 시 자동으로 지갑이 생성됩니다!
        </div>
        <div className="mt-2 text-xs text-red-600">
          ⚠️ <strong>주의:</strong> 결제수단에 빌링키(token)가 있어야 충전이
          가능합니다!
        </div>
      </div>

      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{test.name}</h3>
                <Button
                  onClick={() => runTest(test.name, test.test)}
                  disabled={isLoading[test.name]}
                  variant={
                    results[test.name]?.success
                      ? 'primary'
                      : results[test.name]?.success === false
                        ? 'danger'
                        : 'secondary'
                  }
                  className="min-w-[120px]"
                >
                  {isLoading[test.name]
                    ? '테스트 중...'
                    : results[test.name]?.success === true
                      ? '✅ 성공'
                      : results[test.name]?.success === false
                        ? '❌ 실패'
                        : '테스트 실행'}
                </Button>
              </div>
              <p className="text-sm text-gray-600">{test.description}</p>
            </CardHeader>
            <CardContent>
              {results[test.name] && (
                <div className="mt-4">
                  <div
                    className={`rounded p-3 ${
                      results[test.name].success
                        ? 'border border-green-200 bg-green-50'
                        : 'border border-red-200 bg-red-50'
                    }`}
                  >
                    <h4 className="mb-2 font-semibold">
                      {results[test.name].success ? '✅ 성공' : '❌ 실패'}
                    </h4>
                    {results[test.name].success ? (
                      <pre className="max-h-40 overflow-auto text-xs">
                        {JSON.stringify(results[test.name].data, null, 2)}
                      </pre>
                    ) : (
                      <div>
                        <p className="mb-2 text-sm text-red-600">
                          상태 코드: {results[test.name].status || 'N/A'}
                        </p>
                        <div className="mb-2">
                          <p className="text-sm font-medium text-red-700">
                            에러 메시지:
                          </p>
                          <p className="text-sm text-red-600">
                            {results[test.name].error?.msg ||
                              results[test.name].error?.message ||
                              '알 수 없는 오류'}
                          </p>
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                            상세 에러 정보 보기
                          </summary>
                          <pre className="mt-2 max-h-40 overflow-auto text-xs">
                          {JSON.stringify(results[test.name].error, null, 2)}
                        </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">전체 테스트 실행</h3>
          <p className="text-sm text-gray-600">
            모든 API를 순차적으로 실행합니다 (회원가입 → 로그인 → 상품 등록 →
            결제 및 지갑 플로우).
            <span className="font-medium text-orange-600">
              성공한 테스트들은 주석 처리되어 결제 및 지갑 플로우 테스트만
              실행됩니다.
            </span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
          <Button
            onClick={async () => {
                // 모든 활성화된 테스트 실행 (주석 처리된 테스트는 제외)
              for (const test of tests) {
                await runTest(test.name, test.test)
                await new Promise((resolve) => setTimeout(resolve, 1000)) // 1초 대기
              }
            }}
              className="flex-1"
              variant="primary"
            >
              🚀 모든 테스트 순차 실행
            </Button>
            <Button
              onClick={() => {
                setResults({})
                setIsLoading({})
              }}
              variant="outline"
            >
              🗑️ 결과 초기화
          </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
