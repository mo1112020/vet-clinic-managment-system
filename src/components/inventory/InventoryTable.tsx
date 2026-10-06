
import React from 'react';
import { InventoryItem } from '@/types/database.types';
import { InventoryErrorState } from './InventoryErrorState';
import { InventoryEmptyState } from './InventoryEmptyState';
import { InventoryTableHeader } from './InventoryTableHeader';
import { InventoryItemCard } from './InventoryItem';

type InventoryTableProps = {
  inventoryItems: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  toggleSort: (field: string) => void;
  onEditItem: (item: InventoryItem) => void;
};

export function InventoryTable({
  inventoryItems,
  isLoading,
  error,
  sortBy,
  sortDirection,
  toggleSort,
  onEditItem,
}: InventoryTableProps) {
  if (isLoading && inventoryItems.length === 0) return null;

  if (error) {
    return <InventoryErrorState error={error} />;
  }

  if (inventoryItems.length === 0) {
    return <InventoryEmptyState />;
  }
  
  return (
    <div
    >
      <InventoryTableHeader
        sortBy={sortBy}
        sortDirection={sortDirection}
        toggleSort={toggleSort}
      />
      
      <div className="space-y-3">
        {inventoryItems.map((item, index) => (
          <InventoryItemCard
            key={item.id}
            item={item}
            index={index}
            onEditItem={onEditItem}
          />
        ))}
      </div>
    </div>
  );
}
