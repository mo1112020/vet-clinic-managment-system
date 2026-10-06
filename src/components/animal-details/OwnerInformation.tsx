import { Owner } from '@/types/database.types';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';

interface OwnerInformationProps {
  owner: Owner | null;
}

const OwnerInformation: React.FC<OwnerInformationProps> = ({ owner }) => {
  if (!owner) return null;
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Owner Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-1"
        >
          <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
          <p className="font-medium">{owner.name}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-1"
        >
          <p className="text-sm font-medium text-muted-foreground">ID Number</p>
          <p className="font-medium">{owner.id_number}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-1"
        >
          <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">{owner.phone}</p>
          </div>
        </motion.div>
        {owner.email && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="space-y-1"
          >
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">{owner.email}</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default OwnerInformation;
