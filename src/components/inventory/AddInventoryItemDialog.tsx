import { Tables } from '@/integrations/supabase/types';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addInventoryItem } from '@/services/inventory/add-inventory-item';

type NewInventoryItem = {
  name: string;
  category: string;
  stock: number;
  price: number;
  reorderLevel: number;
}
// fix this later but the app is working fine now 

type AddInventoryItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded?: (item: Tables<'inventory'>) => void;
}

export function AddInventoryItemDialog({ open, onOpenChange, onItemAdded }: AddInventoryItemDialogProps) {
  const [newItem, setNewItem] = useState<NewInventoryItem>({
    name: '',
    category: '',
    stock: 0,
    price: 0,
    reorderLevel: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddItem = async () => {
    if (!newItem.name) {
      toast({
        title: 'Missing information',
        description: 'Please provide a name for the item.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const addedItem = await addInventoryItem({
        productName: newItem.name,
        quantity: newItem.stock,
        price: newItem.price
      });
      
      toast({
        title: 'Item added',
        description: `${newItem.name} has been added to inventory.`,
      });
      
      // Call the callback to add the item to the local state
      // This is useful to update the UI immediately after adding the item
      // It can be used to refresh the inventory list or update the state in the parent component
      // This is useful to update the UI immediately after adding the item
      
      if (onItemAdded) {
        onItemAdded(addedItem);
      }
      
      onOpenChange(false);
      setNewItem({
        name: '',
        category: '',
        stock: 0,
        price: 0,
        reorderLevel: 0
      });
      
    } catch (err) {
      console.error('Error adding inventory item:', err);
      toast({
        title: 'Error',
        description: 'Failed to add inventory item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Enter the details of the new item to add to inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input 
              id="item-name" 
              placeholder="Enter item name" 
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={newItem.category}
              onValueChange={(value) => setNewItem({...newItem, category: value})}
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
              <Label htmlFor="stock">Initial Stock</Label>
              <Input 
                id="stock" 
                type="number" 
                placeholder="0" 
                value={newItem.stock.toString()}
                onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={newItem.price.toString()}
                onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorder-level">Reorder Level</Label>
            <Input 
              id="reorder-level" 
              type="number" 
              placeholder="Enter quantity"
              value={newItem.reorderLevel.toString()}
              onChange={(e) => setNewItem({...newItem, reorderLevel: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAddItem} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Item'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
