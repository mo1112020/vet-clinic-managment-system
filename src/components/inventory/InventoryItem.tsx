
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Syringe, Pill, Scissors, ShoppingBag, Package, Pencil } from 'lucide-react';
import { InventoryItem } from '@/types/database.types';

type InventoryItemProps = {
  item: InventoryItem;
  index: number;
  onEditItem: (item: InventoryItem) => void;
};

export function InventoryItemCard({ item, index, onEditItem }: InventoryItemProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vaccine':
        return <Syringe className="h-4 w-4" />;
      case 'medication':
        return <Pill className="h-4 w-4" />;
      case 'supplies':
        return <Scissors className="h-4 w-4" />;
      case 'food':
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };
  
  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { label: 'Out of Stock', className: 'bg-destructive text-destructive-foreground' };
    if (stock < reorderLevel) return { label: 'Low Stock', className: 'bg-amber-500 text-white' };
    return { label: 'In Stock', className: 'bg-emerald-500 text-white' };
  };

  const stockStatus = getStockStatus(item.stock, item.reorder_level);
  

  return (
    <div
    >
      <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg hover:bg-muted/30 transition-colors">
        {/* Mobile View */}
        <div className="md:hidden space-y-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-muted rounded-full">
                {getCategoryIcon(item.category)}
              </div>
              <span className="font-medium">{item.name}</span>
            </div>
            <Badge className={stockStatus.className}>
              {stockStatus.label}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 p-2 rounded">
              <p className="text-xs text-muted-foreground">Stock</p>
              <p className="font-medium">{item.stock}</p>
            </div>
            <div className="bg-muted/50 p-2 rounded">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-medium">${item.price.toFixed(2)}</p>
            </div>
            <div className="bg-muted/50 p-2 rounded">
              <p className="text-xs text-muted-foreground">Sold</p>
              <p className="font-medium">{item.sold}</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => onEditItem(item)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:flex md:flex-1 md:items-center">
          <div className="p-1.5 bg-muted rounded-full mr-3">
            {getCategoryIcon(item.category)}
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
        <div className="hidden md:block md:w-28 text-center">{item.stock}</div>
        <div className="hidden md:block md:w-28 text-center">${item.price.toFixed(2)}</div>
        <div className="hidden md:block md:w-28 text-center">{item.sold}</div>
        <div className="hidden md:block md:w-28 text-center">
          <Badge className={stockStatus.className}>
            {stockStatus.label}
          </Badge>
        </div>
        <div className="hidden md:block md:w-20 text-center">
          <Button variant="ghost" size="sm" onClick={() => onEditItem(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
