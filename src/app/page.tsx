'use client';

import * as React from 'react';
import { searchAction, type SearchState } from '@/app/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search } from 'lucide-react';
import StartupDirectory from '@/app/components/startup-directory';
import VCDirectory from '@/app/components/vc-directory';
import { initialStartups, initialVCFirms } from '@/lib/initial-data';
import { useToast } from '@/hooks/use-toast';

function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="animate-spin" /> : <Search />}
      <span className="ml-2">Search</span>
    </Button>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = React.useState('startups');

  const initialState: SearchState = {
    startups: initialStartups,
    vcs: initialVCFirms,
    error: null,
    timestamp: Date.now(),
  };

  const [state, formAction] = useFormState(searchAction, initialState);
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: state.error,
      });
    }
  }, [state.error, state.timestamp, toast]);

  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tighter">StartupDB</h1>
        <p className="text-muted-foreground mt-2">
          Intelligent Search for Startups and Venture Capital
        </p>
      </header>

      <Card className="mb-8 border-dashed">
        <CardContent className="p-4">
          <form action={formAction} className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full">
              <Label htmlFor="keywords" className="sr-only">Search Keywords</Label>
              <Input
                id="keywords"
                name="keywords"
                type="text"
                placeholder="e.g., 'early stage fintech in London' or 'AI healthcare VCs'"
                required
                className="text-base"
              />
            </div>
            <input type="hidden" name="type" value={activeTab} />
            <SearchButton />
          </form>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="startups">Startup Directory</TabsTrigger>
          <TabsTrigger value="vcs">VC Directory</TabsTrigger>
        </TabsList>
        <TabsContent value="startups">
          <StartupDirectory data={state.startups} />
        </TabsContent>
        <TabsContent value="vcs">
          <VCDirectory data={state.vcs} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
