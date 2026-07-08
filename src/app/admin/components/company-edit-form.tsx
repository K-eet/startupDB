'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Company } from '@/types/company';
import { updateCompanyFields } from '@/lib/admin-firestore';
import { invalidateCompaniesCache } from '@/hooks/useAllCompanies';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const companyFormSchema = z.object({
  'Company Name': z.string().min(1, 'Company name is required'),
  Slug: z.string(),
  'One-line company description': z.string().optional().default(''),
  'Website URL': z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  Description: z.string().optional().default(''),
  Industry: z.string().optional().default(''),
  'Sub-Industry': z.string().optional().default(''),
  'Company Type': z.string().optional().default(''),
  Technology: z.string().optional().default(''),
  'Sub-Technology': z.union([z.string(), z.array(z.string())]).optional().default(''),
  'Primary Technology': z.string().optional().default(''),
  'Headquarters City': z.string().optional().default(''),
  'Headquarters State': z.string().optional().default(''),
  'Headquarters Country': z.string().optional().default(''),
  'Founded Year': z.coerce.number().min(1900).max(new Date().getFullYear()).or(z.literal(0)).optional(),
  'Company Size': z.string().optional().default(''),
  Status: z.string().optional().default(''),
  'Founder Names': z.union([z.string(), z.array(z.string())]).optional().default(''),
  'Founder Titles': z.union([z.string(), z.array(z.string())]).optional().default(''),
  published: z.boolean().default(true),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const STATUS_OPTIONS = ['Active', 'Inactive', 'Acquired', 'Closed'];
const SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];

interface CompanyEditFormProps {
  company: Company;
}

export function CompanyEditForm({ company }: CompanyEditFormProps) {
  const { toast } = useToast();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      'Company Name': company['Company Name'] ?? '',
      Slug: company.Slug ?? '',
      'One-line company description': company['One-line company description'] ?? '',
      'Website URL': company['Website URL'] ?? '',
      Description: company.Description ?? '',
      Industry: company.Industry ?? '',
      'Sub-Industry': company['Sub-Industry'] ?? '',
      'Company Type': company['Company Type'] ?? '',
      Technology: company.Technology ?? '',
      'Sub-Technology': Array.isArray(company['Sub-Technology'])
        ? company['Sub-Technology'].join('; ')
        : (company['Sub-Technology'] ?? ''),
      'Primary Technology': company['Primary Technology'] ?? '',
      'Headquarters City': company['Headquarters City'] ?? '',
      'Headquarters State': company['Headquarters State'] ?? '',
      'Headquarters Country': company['Headquarters Country'] ?? '',
      'Founded Year': company['Founded Year'] ?? 0,
      'Company Size': company['Company Size'] ?? '',
      Status: ((company as unknown as Record<string, unknown>).Status as string) ?? '',
      'Founder Names': Array.isArray(company['Founder Names'])
        ? company['Founder Names'].join('; ')
        : (company['Founder Names'] ?? ''),
      'Founder Titles': Array.isArray(company['Founder Titles'])
        ? company['Founder Titles'].join('; ')
        : (company['Founder Titles'] ?? ''),
      // Legacy docs have no `published` field — treat as published (visible).
      published: company.published !== false,
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      // Build the update object with legacy field names
      const updates: Partial<Company> = {
        'Company Name': values['Company Name'],
        'One-line company description': values['One-line company description'] ?? '',
        'Website URL': values['Website URL'] ?? '',
        Description: values.Description ?? '',
        Industry: values.Industry ?? '',
        'Sub-Industry': values['Sub-Industry'] ?? '',
        'Company Type': values['Company Type'] ?? '',
        Technology: values.Technology ?? '',
        'Sub-Technology': typeof values['Sub-Technology'] === 'string'
          ? values['Sub-Technology']
          : values['Sub-Technology'] ?? '',
        'Primary Technology': values['Primary Technology'] ?? '',
        'Headquarters City': values['Headquarters City'] ?? '',
        'Headquarters State': values['Headquarters State'] ?? '',
        'Headquarters Country': values['Headquarters Country'] ?? '',
        'Founded Year': values['Founded Year'] ?? 0,
        'Company Size': values['Company Size'] ?? '',
        'Founder Names': typeof values['Founder Names'] === 'string'
          ? values['Founder Names']
          : values['Founder Names'] ?? '',
        'Founder Titles': typeof values['Founder Titles'] === 'string'
          ? values['Founder Titles']
          : values['Founder Titles'] ?? '',
        published: values.published,
        updatedAt: new Date().toISOString(),
      };

      await updateCompanyFields(company.Slug, updates);
      invalidateCompaniesCache(); // so the directory/admin list refetch shows the edit

      toast({
        title: 'Company updated',
        description: values.published
          ? `${values['Company Name']} saved and live in the directory.`
          : `${values['Company Name']} saved as a hidden draft.`,
      });
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: 'Update failed',
        description: 'Could not save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Identity */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Identity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="Company Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (read-only)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="One-line company description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>One-line Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Website URL"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Description */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <FormField
            control={form.control}
            name="Description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* Classification */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Classification</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="Industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Sub-Industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-Industry</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Company Type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Technology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technology</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Sub-Technology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-Technology</FormLabel>
                  <FormControl>
                    <Input {...field} value={typeof field.value === 'string' ? field.value : Array.isArray(field.value) ? field.value.join('; ') : ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Primary Technology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Technology</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Location</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="Headquarters City"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Headquarters State"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Headquarters Country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Facts */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Facts</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="Founded Year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Founded Year</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Company Size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* People */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">People</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="Founder Names"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Founder Names (semicolon-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} value={typeof field.value === 'string' ? field.value : Array.isArray(field.value) ? field.value.join('; ') : ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Founder Titles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Founder Titles (semicolon-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} value={typeof field.value === 'string' ? field.value : Array.isArray(field.value) ? field.value.join('; ') : ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Visibility — fold publish into the edit so a draft can be published in one step */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Visibility</h2>
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 border border-border p-4">
                <div className="space-y-1">
                  <FormLabel>Published</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {field.value
                      ? 'Live in the public directory.'
                      : 'Hidden draft — not shown in the directory until you publish.'}
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </section>

        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
