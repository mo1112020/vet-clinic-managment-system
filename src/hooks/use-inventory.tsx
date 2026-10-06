import { Tables } from '@/integrations/supabase/types';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/database.types';
import { useToast } from '@/hooks/use-toast';

export function useInventory(
  searchQuery?: string,
  categoryFilter?: string[],
  stockFilter?: string,
  sortBy?: string,
  sortDirection?: 'asc' | 'desc'
) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const stats = useMemo(() => ({
    totalItems: inventoryItems.reduce((sum, item) => sum + item.stock, 0),
    lowStockItems: inventoryItems.filter(item => item.stock < item.reorder_level).length,
    totalValue: inventoryItems.reduce((sum, item) => sum + item.stock * item.price, 0),
  }), [inventoryItems]);
  const { toast } = useToast();

  const fetchInventory = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('inventory').select('*');

      if (searchQuery) {
        query = query.ilike('product_name', `%${searchQuery}%`);
      }

      // Note: We're skipping categoryFilter since it's not in the database schema

      if (stockFilter === 'low') {
        query = query.lt('quantity', 10); // Using a fixed value instead of reorder_level
      } else if (stockFilter === 'out') {
        query = query.eq('quantity', 0);
      }

      if (sortBy && sortDirection) {
        // Map frontend sort field names to database column names
        const sortFieldMap: Record<string, string> = {
          'name': 'product_name',
          'stock': 'quantity',
          'price': 'price',
          'sold': 'product_name' // Sold is a derived zero, not a database column.
        };
        
        const dbSortField = sortFieldMap[sortBy] || sortBy;
        query = query.order(dbSortField, { ascending: sortDirection === 'asc' });
      }

      const { data, error } = await query.abortSignal(controller.signal);
      if (controller.signal.aborted) return;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Map database inventory to application InventoryItem type
      const mappedItems: InventoryItem[] = data.map(item => ({
        id: item.id,
        name: item.product_name,
        category: 'supplies', // Default category as it's not in the database
        stock: item.quantity,
        price: item.price,
        sold: 0, // Default value
        reorder_level: 5 // Default value
      }));

      setInventoryItems(mappedItems);

    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
      toast({
        title: 'Error',
        description: 'Failed to load inventory. Please try again.',
        variant: 'destructive',
      });
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [searchQuery, stockFilter, sortBy, sortDirection, toast]);

  // Function to add a new item to the local state
  const addItem = (newItem: Tables<'inventory'>) => {
    const mappedItem: InventoryItem = {
      id: newItem.id,
      name: newItem.product_name,
      category: 'supplies', // Default category
      stock: newItem.quantity,
      price: newItem.price,
      sold: 0,
      reorder_level: 5
    };
    
    setInventoryItems(prev => [mappedItem, ...prev]);
    
  };

  // Function to update an existing item in the local state
  const updateItem = (updatedItem: Tables<'inventory'>) => {
    setInventoryItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === updatedItem.id) {
          return {
            ...item,
            name: updatedItem.product_name,
            stock: updatedItem.quantity,
            price: updatedItem.price
          };
        }
        return item;
      });
      
      return newItems;
    });
  };

  useEffect(() => {
    fetchInventory();
    return () => request.current?.abort();
  }, [fetchInventory]);

  return { 
    inventoryItems, 
    stats, 
    isLoading, 
    error, 
    refreshInventory: fetchInventory,
    addItem,
    updateItem
  };
}
