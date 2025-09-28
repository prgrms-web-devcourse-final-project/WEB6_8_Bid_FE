import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ButtonProps, buttonVariants } from '@/components/ui/button'

// 최적화된 페이징 계산 함수 (백엔드 PageLimitCalculator와 동일한 로직)
export const calculatePageLimit = (
  page: number,
  pageSize: number,
  movablePageCount: number = 5,
) => {
  return ((page - 1) / movablePageCount + 1) * pageSize * movablePageCount + 1
}

// 현재 구간의 시작 페이지 계산
export const getCurrentGroupStart = (
  page: number,
  movablePageCount: number = 5,
) => {
  return Math.floor((page - 1) / movablePageCount) * movablePageCount + 1
}

// 현재 구간의 끝 페이지 계산
export const getCurrentGroupEnd = (
  page: number,
  movablePageCount: number = 5,
) => {
  return (
    Math.floor((page - 1) / movablePageCount) * movablePageCount +
    movablePageCount
  )
}

// 최적화된 페이징 컴포넌트 Props
interface OptimizedPaginationProps {
  currentPage: number
  pageSize: number
  totalCount: number // 백엔드에서 받은 count (limit까지만 세는 값)
  movablePageCount?: number // 한 화면에서 보여줄 페이지 버튼 개수 (기본값: 5)
  onPageChange: (page: number) => void
  className?: string
}

// 최적화된 페이징 컴포넌트
export const OptimizedPagination = ({
  currentPage,
  pageSize,
  totalCount,
  movablePageCount = 5,
  onPageChange,
  className,
}: OptimizedPaginationProps) => {
  const limit = calculatePageLimit(currentPage, pageSize, movablePageCount)
  const hasNextGroup = totalCount > limit

  const currentGroupStart = getCurrentGroupStart(currentPage, movablePageCount)
  const currentGroupEnd = getCurrentGroupEnd(currentPage, movablePageCount)

  // 현재 구간에서 실제로 표시할 페이지들
  const pages = []
  for (let i = currentGroupStart; i <= currentGroupEnd; i++) {
    // 실제 데이터가 있는 페이지까지만 표시
    const maxPossiblePage = Math.ceil(totalCount / pageSize)
    if (i <= maxPossiblePage) {
      pages.push(i)
    }
  }

  const handlePreviousGroup = () => {
    const prevGroupStart = currentGroupStart - movablePageCount
    if (prevGroupStart >= 1) {
      onPageChange(prevGroupStart)
    }
  }

  const handleNextGroup = () => {
    if (hasNextGroup) {
      onPageChange(currentGroupEnd + 1)
    }
  }

  const hasPreviousGroup = currentGroupStart > 1

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
    >
      <ul className="flex flex-row items-center gap-1">
        {/* 이전 구간 버튼 */}
        {hasPreviousGroup && (
          <li>
            <button
              onClick={handlePreviousGroup}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'default' }),
                'gap-1 pl-2.5',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>이전</span>
            </button>
          </li>
        )}

        {/* 페이지 번호들 */}
        {pages.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={cn(
                buttonVariants({
                  variant: page === currentPage ? 'outline' : 'ghost',
                  size: 'default',
                }),
                'h-9 w-9 p-0',
              )}
            >
              {page}
            </button>
          </li>
        ))}

        {/* 다음 구간 버튼 */}
        {hasNextGroup && (
          <li>
            <button
              onClick={handleNextGroup}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'default' }),
                'gap-1 pr-2.5',
              )}
            >
              <span>다음</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className,
    )}
    {...props}
  />
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
