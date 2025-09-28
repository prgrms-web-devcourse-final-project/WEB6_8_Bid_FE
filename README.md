# 새 프로젝트

Next.js 14, Supabase, Tailwind를 사용하는 프로젝트입니다.

## API 통신 구조

이 프로젝트는 백엔드 API와 통신하기 위한 핵심 구조가 준비되어 있습니다:

### 주요 파일들

- `src/app/api/proxy/[...path]/route.ts` - 백엔드 API 프록시 서버
- `src/lib/api/api-client.ts` - Axios 기반 API 클라이언트
- `src/lib/api/common.ts` - 공통 API 유틸리티 함수들
- `src/hooks/useApiError.ts` - API 에러 처리 훅

### 사용법

```typescript
import { apiClient } from '@/lib/api'

// GET 요청
const response = await apiClient.get('/api/endpoint')

// POST 요청
const response = await apiClient.post('/api/endpoint', data)
```

## 개발 시작

```bash
npm run dev
```

포트: 8031
