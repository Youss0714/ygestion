import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from '@/lib/i18n';
import { useSettings } from '@/hooks/useSettings';
import { Save } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  businessType: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditor() {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      company: '',
      position: '',
      address: '',
      businessType: '',
    },
  });

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: (user as any).firstName || '',
        lastName: (user as any).lastName || '',
        phone: (user as any).phone || '',
        company: (user as any).company || '',
        position: (user as any).position || '',
        address: (user as any).address || '',
        businessType: (user as any).businessType || '',
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: t('success'),
        description: settings?.language === 'en' ? 'Profile updated successfully' : 'Profil mis à jour avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message || (settings?.language === 'en' ? 'Failed to update profile' : 'Erreur lors de la mise à jour du profil'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profileFirstName')}</FormLabel>
                <FormControl>
                  <Input placeholder={settings?.language === 'en' ? 'First name' : 'Prénom'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profileLastName')}</FormLabel>
                <FormControl>
                  <Input placeholder={settings?.language === 'en' ? 'Last name' : 'Nom'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profilePhone')}</FormLabel>
                <FormControl>
                  <Input placeholder={settings?.language === 'en' ? 'Phone number' : 'Numéro de téléphone'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profileCompany')}</FormLabel>
                <FormControl>
                  <Input placeholder={settings?.language === 'en' ? 'Company name' : 'Nom de l\'entreprise'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profilePosition')}</FormLabel>
                <FormControl>
                  <Input placeholder={settings?.language === 'en' ? 'Position/Title' : 'Poste/Titre'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profileBusinessType')}</FormLabel>
                <FormControl>
                  <Input placeholder={settings?.language === 'en' ? 'Business type' : 'Type d\'activité'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profileAddress')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={settings?.language === 'en' ? 'Complete address' : 'Adresse complète'} 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateProfileMutation.isPending
              ? (settings?.language === 'en' ? 'Updating...' : 'Mise à jour...')
              : t('updateProfile')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}