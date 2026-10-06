import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function ListPagination({ page, pageSize, total, onPageChange, disabled = false }: Props) {
  const navigationRef = useRef<HTMLElement>(null);
  const requestedPage = useRef<number | null>(null);
  useEffect(() => {
    if (requestedPage.current !== page) return;
    requestedPage.current = null;
    // The app scrolls inside main, rather than the browser window.
    const scroller = navigationRef.current?.closest('main');
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);
  const changePage = (nextPage: number) => {
    requestedPage.current = nextPage;
    onPageChange(nextPage);
  };
  const { language } = useLanguage();
  const tr = language === 'tr';
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (!total) return null;
  return (
    <nav ref={navigationRef} aria-label={tr ? 'Sayfalama' : 'Pagination'} className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <span className="text-sm text-muted-foreground">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={disabled || page <= 1} onClick={() => changePage(page - 1)}>{tr ? 'Önceki' : 'Previous'}</Button>
        <span className="text-sm" aria-live="polite">{page} / {pages}</span>
        <Button variant="outline" size="sm" disabled={disabled || page >= pages} onClick={() => changePage(page + 1)}>{tr ? 'Sonraki' : 'Next'}</Button>
      </div>
    </nav>
  );
}
import { useEffect, useRef } from 'react';
