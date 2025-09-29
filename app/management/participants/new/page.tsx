'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AucoSDK } from 'auco-sdk-integration';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
  type: z.string().min(2, { message: 'Type must be at least 2 characters.' }),
  id_number: z.string().optional(),
  document_type: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  bank_info: z.string().optional(),
  artistic_name: z.string().optional(),
  management_entity: z.string().optional(),
  ipi: z.string().optional(),
  user_id: z.string().optional(),
  auco_verification_id: z.string().optional(),
  verification_status: z.string().optional(),
});

interface LinkableEntity {
  id: string;
  name: string;
  type: 'user' | 'artist' | 'participant';
  email: string | null;
  country: string | null;
  user_id: string | null;
  id_number: string | null;
  address: string | null;
  phone: string | null;
  bank_info: any | null;
  artistic_name: string | null;
  management_entity: string | null;
  ipi: string | null;
}

export default function NewParticipantPage() {
  const router = useRouter();
  const [linkableEntities, setLinkableEntities] = useState<LinkableEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [unmountAuco, setUnmountAuco] = useState<(() => void) | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      type: 'ARTISTA',
      id_number: '',
      document_type: '',
      address: '',
      country: '',
      phone: '',
      bank_info: '',
      artistic_name: '',
      management_entity: '',
      ipi: '',
      user_id: '',
      auco_verification_id: '',
      verification_status: 'not_verified',
    },
  });

  const verificationStatus = form.watch('verification_status');
  const { email, document_type, country, id_number, phone, name } = form.watch();
  const isVerificationDisabled = !email || !document_type || !country || !id_number || !phone || !name;

  useEffect(() => {
    return () => {
      if (unmountAuco) unmountAuco();
    };
  }, [unmountAuco]);

  useEffect(() => {
    async function fetchLinkableEntities() {
      try {
        const res = await fetch('/api/linkable-entities');
        if (res.ok) {
          const data = await res.json();
          setLinkableEntities(data);
        } else {
          const errorText = await res.text();
          console.error('Failed to fetch linkable entities:', res.status, res.statusText, errorText);
        }
      } catch (error) {
        console.error('Error fetching linkable entities:', error);
      }
    }
    fetchLinkableEntities();
  }, []);

  useEffect(() => {
    if (selectedEntityId) {
      const entity = linkableEntities.find((e) => e.id === selectedEntityId);
      if (entity) {
        form.setValue('name', entity.name, { shouldValidate: true });
        form.setValue('artistic_name', entity.artistic_name || entity.name, { shouldValidate: true });
        form.setValue('country', entity.country || '', { shouldValidate: true });
        form.setValue('email', entity.email || '', { shouldValidate: true });
        form.setValue('id_number', entity.id_number || '', { shouldValidate: true });
        form.setValue('address', entity.address || '', { shouldValidate: true });
        form.setValue('phone', entity.phone || '', { shouldValidate: true });
        form.setValue(
          'bank_info',
          entity.bank_info ? JSON.stringify(entity.bank_info, null, 2) : '',
          { shouldValidate: true }
        );
        form.setValue('management_entity', entity.management_entity || '', { shouldValidate: true });
        form.setValue('ipi', entity.ipi || '', { shouldValidate: true });
        // Don't override user_id as it's used for the selection itself
        // if (entity.user_id) form.setValue('user_id', entity.user_id, { shouldValidate: true });
        if (entity.type === 'artist') form.setValue('type', 'ARTISTA', { shouldValidate: true });
      }
    } else {
      form.reset({
        ...form.getValues(),
        name: '',
        artistic_name: '',
        country: '',
        email: '',
        user_id: '',
        id_number: '',
        address: '',
        phone: '',
        bank_info: '',
        management_entity: '',
        ipi: '',
      });
    }
  }, [selectedEntityId, linkableEntities, form]);

  async function handleVerification() {
    setIsVerifying(true);
    form.setValue('verification_status', 'pending');

    try {
      const { name, email, id_number, country, document_type, phone } = form.getValues();

      const payload = {
        name,
        email,
        id_number,
        country,
        document_type,
        phone,
      };

      const response = await fetch('/api/auco/start-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const raw = await response.text();
        throw new Error(
          `Backend /api/auco/start-verification ${response.status} ${response.statusText} — ${raw}`
        );
      }

      const { document_code } = await response.json();
      form.setValue('auco_verification_id', document_code);

      const unmount = AucoSDK({
        sdkType: 'validation',
        iframeId: 'auco-sdk-container',
        language: 'es',
        keyPublic: process.env.NEXT_PUBLIC_AUCO_PUK as string,
        env: (process.env.NEXT_PUBLIC_AUCO_ENV === 'dev') ? 'DEV' : 'PROD',
        sdkData: {
          document: document_code,
          uxOptions: { primaryColor: '#3B82F6', alternateColor: '#FFFFFF' },
        },
        events: {
          onSDKReady: () => console.log('Auco SDK is ready.'),
          onSDKClose: (similarity, status) => {
            console.log('Auco flow closed by user.', { similarity, status });
            if (status !== 'success' && form.getValues('verification_status') === 'pending') {
              form.setValue('verification_status', 'not_verified');
            }
            setIsVerifying(false);
            if (unmount) unmount();
            setUnmountAuco(null);
          },
        },
      });
      setUnmountAuco(() => unmount);
    } catch (error: any) {
      console.error('Error during verification process:', error);
      alert(error?.message || 'Verification failed');
      form.setValue('verification_status', 'error');
      setIsVerifying(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('📤 Submitting participant data:', values);
    
    // Clean up empty strings to avoid database issues
    const cleanedValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key, 
        value === '' ? null : value
      ])
    );
    
    // If user_id is selected but causing FK constraint issues, 
    // allow creating without user_id as fallback
    const payload = { ...cleanedValues };
    
    console.log('🧹 Cleaned participant data:', cleanedValues);
    
    try {
      let res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', res.status, res.statusText);

      // If foreign key constraint error and user_id is present, try without user_id
      if (!res.ok && payload.user_id) {
        let errorDetails;
        try {
          const responseText = await res.text();
          errorDetails = JSON.parse(responseText);
          console.log('📋 First attempt error details:', errorDetails);
        } catch (e) {
          console.log('📋 Could not parse error response');
          errorDetails = {};
        }
        
        if (errorDetails.code === '23503' || errorDetails.originalMessage?.includes('user_id_fkey')) {
          console.log('🔄 Retrying without user_id due to FK constraint...');
          
          const payloadWithoutUserId = { ...payload, user_id: null };
          console.log('🧹 Retry payload:', payloadWithoutUserId);
          
          res = await fetch('/api/participants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadWithoutUserId),
          });
          
          console.log('📥 Retry response status:', res.status, res.statusText);
        }
      }

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Participant created successfully:', data);
        router.push('/management/participants');
      } else {
        let finalErrorDetails;
        try {
          const responseText = await res.text();
          finalErrorDetails = JSON.parse(responseText);
        } catch (e) {
          finalErrorDetails = { message: 'Error desconocido' };
        }
        
        console.error('❌ Final error creating participant:', {
          status: res.status,
          statusText: res.statusText,
          errorDetails: finalErrorDetails
        });
        
        const errorMessage = finalErrorDetails.message || finalErrorDetails.error || 'Error desconocido';
        alert(`❌ Error al crear participante:\n\n${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert(`Network error: ${error}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Native iPhone Header */}
      <div className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />
        
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">+</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground mb-1">
                Create New Participant
              </h1>
              <p className="text-sm text-muted-foreground">
                Add a new participant to your management system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Native iPhone Form Container */}
      <div className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to User or Artist</FormLabel>
                <Select
                  value={selectedEntityId || field.value || ''}
                  onValueChange={(val) => {
                    setSelectedEntityId(val);
                    field.onChange(val);
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an entity to auto-fill..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {linkableEntities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        <span className="capitalize">[{entity.type}]</span> {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Link to an existing entity to auto-fill their details.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participant Name</FormLabel>
                <FormControl>
                  <Input placeholder="Participant's full legal name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="artistic_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artistic Name</FormLabel>
                <FormControl>
                  <Input placeholder="Artistic name (if different)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="participant@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Native iPhone Verification Section */}
          <div className="bg-muted/30 border rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Identity Verification (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Verification is optional. Participants can be created without identity verification.
              </p>
              <p className="text-sm text-muted-foreground">
                You can always verify identity later in the participant&apos;s profile.
              </p>
            </div>

            {/* Responsive Grid for Verification Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ES, CO" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DNI">DNI (España)</SelectItem>
                        <SelectItem value="CC">Cédula (Colombia)</SelectItem>
                        <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Identification number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone and Verification Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (with country code)</FormLabel>
                    <FormControl>
                      <Input placeholder="+573003003030" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <Button
                  type="button"
                  onClick={handleVerification}
                  disabled={isVerifying || verificationStatus === 'verified' || isVerificationDisabled}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Identity (Optional)'}
                </Button>
                {verificationStatus && (
                  <Badge
                    variant={
                      verificationStatus === 'verified'
                        ? 'default'
                        : verificationStatus === 'pending'
                        ? 'secondary'
                        : verificationStatus === 'error'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {verificationStatus}
                  </Badge>
                )}
              </div>
            </div>

            {isVerifying && (
              <div className="mt-4">
                <div id="auco-sdk-container" className="w-full h-[500px] rounded-xl border bg-background" />
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a participant type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ARTISTA">Artista</SelectItem>
                    <SelectItem value="PRODUCTOR">Productor</SelectItem>
                    <SelectItem value="COMPOSITOR">Compositor</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="LAWYER">Lawyer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Additional Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Participant's address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Info</FormLabel>
                  <FormControl>
                    <Input placeholder="Bank account details" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="management_entity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Management Entity</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PRO, publisher" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ipi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IPI</FormLabel>
                  <FormControl>
                    <Input placeholder="IPI number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Native iPhone Action Buttons */}
          <div className="bg-muted/30 border rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="flex-1">
                  Create Participant
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const values = form.getValues();
                    const cleanedValues = Object.fromEntries(
                      Object.entries(values).map(([key, value]) => [
                        key, 
                        value === '' ? null : value
                      ])
                    );
                    // Force create without user_id
                    onSubmit({ ...cleanedValues, user_id: null });
                  }}
                >
                  Create Without Link
                </Button>
              </div>
              
              {verificationStatus !== 'verified' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span className="text-blue-500">ℹ️</span>
                    Verification is optional. Participants can be created without identity verification.
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
      </div>
    </div>
  );
}
