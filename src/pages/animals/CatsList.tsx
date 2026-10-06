
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Cat, Calendar, File, Clipboard, Phone, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ListPagination } from '@/components/ui/list-pagination';
import { useAnimals } from '@/hooks/use-animals';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

const CatsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [queryToSearch, setQueryToSearch] = useState('');
  const { t } = useLanguage();
  
  // Use the custom hook to fetch cats data from Supabase
  const { animals: cats, isLoading, hasData, error, total, page, pageSize, setPage, refetch } = useAnimals('cat', queryToSearch, 'registry');
  
  const handleSearch = () => {
    setQueryToSearch(searchQuery);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t('cats')}</h1>
        <p className="text-muted-foreground">{t('registeredCats')}</p>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('searchCats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={t('searchByNameBreed')}
              className="glass-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} className="btn-primary">
              <Search className="h-4 w-4 mr-2" />
              {t('search')}
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />{t('refresh')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center">
              <Cat className="h-5 w-5 mr-2 text-amber-500" />
              {t('catsRegistry')}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-12 text-destructive">
              <p>{t('errorCats')} {error}</p>
            </div>
          ) : !hasData ? null : cats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('noCats')}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('breed')}</TableHead>
                    <TableHead>{t('chipNo')}</TableHead>
                    <TableHead>{t('owner')}</TableHead>
                    <TableHead>{t('contact')}</TableHead>
                    <TableHead>{t('lastVisit')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cats.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{cat.breed}</TableCell>
                      <TableCell>
                        {cat.chipNo && (
                          <div className="flex items-center gap-2">
                            <Clipboard className="h-4 w-4 text-muted-foreground" />
                            <span>{cat.chipNo}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{cat.owner?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {cat.owner?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{cat.owner.phone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {cat.last_visit && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(cat.last_visit), 'yyyy-MM-dd')}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link to={`/animals/${cat.id}`}>
                          <Button variant="outline" size="sm">
                            <File className="h-4 w-4 mr-2" />
                            {t('view')}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <ListPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} disabled={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CatsList;


//in the fututre i will make a list for other animals like cats, birds, etc. and make a single component for all animals
// and then use that component in the list for each animal type. This will help to keep the code DRY and maintainable.
// I will also add a filter for the animal type in the search input, so that users can search for specific animal types.