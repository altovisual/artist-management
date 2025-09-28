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
          setLinkableEntities(await res.json());
        } else {
          console.error('Failed to fetch linkable entities');
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
        if (entity.user_id) form.setValue('user_id', entity.user_id, { shouldValidate: true });
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
    const res = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push('/management/participants');
    } else {
      const errorDetails = await res.json().catch(() => ({}));
      console.error('Failed to create participant:', errorDetails);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Participant</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to User or Artist</FormLabel>
                <Select
                  value={field.value || ''}
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

          <div className="p-4 border rounded-md">
            <div className="flex items-start space-x-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="w-1/4">
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
                  <FormItem className="w-1/4">
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document type" />
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
                  <FormItem className="flex-grow">
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Identification number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-end space-x-4 mt-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="w-1/3">
                    <FormLabel>Phone (with country code)</FormLabel>
                    <FormControl>
                      <Input placeholder="+573003003030" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex-grow" />
              <Button
                type="button"
                onClick={handleVerification}
                disabled={isVerifying || verificationStatus === 'verified' || isVerificationDisabled}
              >
                {isVerifying ? 'Verifying...' : 'Verify Identity with Auco'}
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

            {isVerifying && <div id="auco-sdk-container" className="w-full h-[500px] mt-4 rounded-md border" />}
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

          <Button type="submit" disabled={verificationStatus !== 'verified'}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
