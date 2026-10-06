import { useState } from 'react';

export function useListPagination<T>(items: T[], resetKey = '', pageSize = 10) {
  const [selection, setSelection] = useState({ key: resetKey, page: 1 });
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  if (selection.key !== resetKey) setSelection({ key: resetKey, page: 1 });
  const page = selection.key === resetKey ? Math.min(selection.page, pageCount) : 1;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page, pageSize, total: items.length,
    onPageChange: (page: number) => setSelection({ key: resetKey, page }),
  };
}
