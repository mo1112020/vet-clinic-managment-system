import { Tables } from '@/integrations/supabase/types';
import { ListPagination } from '@/components/ui/list-pagination';
import { useListPagination } from '@/hooks/use-list-pagination';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { InventoryStatCards } from '@/components/inventory/InventoryStatCards';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { AddInventoryItemDialog } from '@/components/inventory/AddInventoryItemDialog';
import { EditInventoryItemDialog } from '@/components/inventory/EditInventoryItemDialog';
import { useInventory } from '@/hooks/use-inventory';
import { InventoryItem } from '@/types/database.types';
import { useLanguage } from '@/contexts/LanguageContext';

const InventoryManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<string | undefined>(undefined);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<InventoryItem | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { t } = useLanguage();
  
  // Use the custom hook to fetch inventory data from Supabase
  const { 
    inventoryItems, 
    stats, 
    isLoading, 
    error, 
    addItem, 
    updateItem 
  } = useInventory(
    searchQuery,
    categoryFilter,
    stockFilter,
    sortBy,
    sortDirection
  );
  
  const pagination = useListPagination(inventoryItems, JSON.stringify([searchQuery, categoryFilter, stockFilter, sortBy, sortDirection]));

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setCurrentEditItem(item);
    setEditItemDialogOpen(true);
  };

  const handleItemAdded = (newItem: Tables<'inventory'>) => {
    addItem(newItem);
  };

  const handleItemUpdated = (updatedItem: Tables<'inventory'>) => {
    updateItem(updatedItem);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t('inventoryManagement')}</h1>
        <p className="text-muted-foreground">{t('manageStock')}</p>
      </div>
      
      <InventoryStatCards 
        totalItems={stats.totalItems}
        lowStockItems={stats.lowStockItems}
        totalValue={stats.totalValue}
        isLoading={isLoading}
      />
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>{t('inventoryItems')}</CardTitle>
              <CardDescription>{t('manageStockAndSupplies')}</CardDescription>
            </div>
            <AddInventoryItemDialog 
              open={addItemDialogOpen}
              onOpenChange={setAddItemDialogOpen}
              onItemAdded={handleItemAdded}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <InventoryFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
            />
            
            <InventoryTable
              inventoryItems={pagination.items}
              isLoading={isLoading}
              error={error}
              sortBy={sortBy}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
              onEditItem={handleEditItem}
            />
          </div>
        </CardContent>
        
        <CardFooter className="block"><ListPagination {...pagination} /></CardFooter>
      </Card>
      
      {/* Edit Item Dialog */}
      <EditInventoryItemDialog 
        open={editItemDialogOpen}
        onOpenChange={setEditItemDialogOpen}
        item={currentEditItem}
        onItemUpdated={handleItemUpdated}
      />
    </div>
  );
};

export default InventoryManagement;
