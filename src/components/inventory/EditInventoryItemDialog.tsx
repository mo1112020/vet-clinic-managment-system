import { Tables } from '@/integrations/supabase/types';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem } from '@/types/database.types';

type EditInventoryItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onItemUpdated?: (item: Tables<'inventory'>) => void;
};

export function EditInventoryItemDialog({ open, onOpenChange, item, onItemUpdated }: EditInventoryItemDialogProps) {
  const [editedItem, setEditedItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Update the form when the item changes
  useEffect(() => {
    if (item) {
      setEditedItem({ ...item });
    }
  }, [item]);

  // Reset the form when the dialog closes
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  if (!editedItem) return null;

  const handleUpdateItem = async () => {
    if (!editedItem.name) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          product_name: editedItem.name,
          quantity: editedItem.stock,
          price: editedItem.price
        })
        .eq('id', editedItem.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Item updated',
        description: `${editedItem.name} has been updated.`,
      });
      
      // Call the callback to update the item in the local state
      
      if (onItemUpdated && data) {
        onItemUpdated(data);
      }
      
      onOpenChange(false);
      
    } catch (err) {
      console.error('Error updating inventory item:', err);
      toast({
        title: 'Error',
        description: 'Failed to update inventory item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Update the details of this inventory item.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input 
              id="item-name" 
              placeholder="Enter item name" 
              value={editedItem.name}
              onChange={(e) => setEditedItem({...editedItem, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={editedItem.category}
              onValueChange={(value: InventoryItem['category']) => setEditedItem({...editedItem, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vaccine">Vaccine</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="food">Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input 
                id="stock" 
                type="number" 
                placeholder="0" 
                value={editedItem.stock?.toString() || '0'}
                onChange={(e) => setEditedItem({...editedItem, stock: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={editedItem.price?.toString() || '0'}
                onChange={(e) => setEditedItem({...editedItem, price: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorder-level">Reorder Level</Label>
            <Input 
              id="reorder-level" 
              type="number" 
              placeholder="Enter quantity"
              value={editedItem.reorder_level?.toString() || '0'}
              onChange={(e) => setEditedItem({...editedItem, reorder_level: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleUpdateItem} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Item'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
