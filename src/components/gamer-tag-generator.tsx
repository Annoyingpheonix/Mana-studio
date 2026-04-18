'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition } from 'react';
import { generateGamerTag } from '@/ai/flows/generate-gamer-tag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sparkles, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

export function GamerTagGenerator() {
  const [isPending, startTransition] = useTransition();
  const [generatedTag, setGeneratedTag] = useState<string | null>(null);
  const { toast } = useToast();
  const heroImage = PlaceHolderImages.find(img => img.id === 'gamer-tag-hero');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setGeneratedTag(null);
    startTransition(async () => {
      try {
        const result = await generateGamerTag(values);
        if (result && result.gamertag) {
          setGeneratedTag(result.gamertag);
        } else {
          throw new Error('Invalid response from server.');
        }
      } catch (error) {
        console.error("Failed to generate gamer tag:", error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    });
  }

  const copyToClipboard = async () => {
    if (generatedTag) {
      try {
        await navigator.clipboard.writeText(generatedTag);
        toast({
          title: 'Copied!',
          description: `"${generatedTag}" copied to your clipboard.`,
        });
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast({
          title: 'Error',
          description: 'Could not copy to clipboard. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-8">
       {heroImage && (
         <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
            <Image 
                src={heroImage.imageUrl} 
                alt={heroImage.description}
                fill
                style={{objectFit: 'cover'}}
                data-ai-hint={heroImage.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl font-bold font-headline text-primary-foreground drop-shadow-lg">Gamer Tag Forge</h1>
                <p className="text-primary-foreground/80 drop-shadow-md">Craft your new identity with the power of AI.</p>
            </div>
         </div>
       )}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Generate Your Gamer Tag</CardTitle>
          <CardDescription>Tell us your name and we&apos;ll forge a legendary tag for you.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tag
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {(isPending || generatedTag) && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Your New Gamer Tag</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-8 bg-muted/50 rounded-md">
            {isPending ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              generatedTag && (
                <div className="flex items-center gap-4 animate-in fade-in-50">
                  <p className="text-3xl font-bold text-accent font-headline">{generatedTag}</p>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
