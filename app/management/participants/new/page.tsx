"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  type: z.string().min(2, { message: "Type must be at least 2 characters." }),
  id_number: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  bank_info: z.string().optional(),
  artistic_name: z.string().optional(),
  management_entity: z.string().optional(),
  ipi: z.string().optional(),
  user_id: z.string().optional(),
});

interface LinkableEntity {
  id: string;
  name: string;
  type: 'user' | 'artist';
  email: string | null;
  country: string | null;
  user_id: string | null;
}

export default function NewParticipantPage() {
  const router = useRouter();
  const [linkableEntities, setLinkableEntities] = useState<LinkableEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      type: "artist",
      id_number: "",
      address: "",
      country: "",
      phone: "",
      bank_info: "",
      artistic_name: "",
      management_entity: "",
      ipi: "",
      user_id: "",
    },
  });

  useEffect(() => {
    async function fetchLinkableEntities() {
      try {
        const res = await fetch("/api/linkable-entities");
        if (res.ok) {
          setLinkableEntities(await res.json());
        } else {
          console.error("Failed to fetch linkable entities");
        }
      } catch (error) {
        console.error("Error fetching linkable entities:", error);
      }
    }
    fetchLinkableEntities();
  }, []);

  useEffect(() => {
    if (selectedEntityId) {
      const entity = linkableEntities.find(e => e.id === selectedEntityId);
      if (entity) {
        if (entity.type === 'artist') {
          form.setValue("name", entity.name, { shouldValidate: true });
          form.setValue("artistic_name", entity.name, { shouldValidate: true });
          form.setValue("country", entity.country || '', { shouldValidate: true });
          form.setValue("email", entity.email || '', { shouldValidate: true });
          if (entity.user_id) {
            form.setValue("user_id", entity.user_id, { shouldValidate: true });
          }
        } else if (entity.type === 'user') {
          form.setValue("name", entity.name, { shouldValidate: true });
          form.setValue("email", entity.email || '', { shouldValidate: true });
          form.setValue("user_id", entity.id, { shouldValidate: true });
        }
      }
    } else {
      // Reset fields when selection is cleared
      form.reset({ ...form.getValues(), name: '', artistic_name: '', country: '', email: '', user_id: '' });
    }
  }, [selectedEntityId, linkableEntities, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/management/participants");
    } else {
      // Log the detailed error from the API response
      const errorDetails = await res.json();
      console.error("Failed to create participant:", errorDetails);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Participant</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="user_id" // Field is repurposed for selection, value is the entity ID
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to User or Artist</FormLabel>
                <Select onValueChange={setSelectedEntityId} value={field.value}>
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
                <FormDescription>
                  Link to an existing entity to auto-fill their details.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Participant Fields */}
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Participant Name</FormLabel><FormControl><Input placeholder="Participant's full legal name" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="artistic_name" render={({ field }) => (<FormItem><FormLabel>Artistic Name</FormLabel><FormControl><Input placeholder="Artistic name (if different)" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="participant@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
          <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="Country of residence" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="id_number" render={({ field }) => (<FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="Identification number" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Participant's address" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="Participant's phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="bank_info" render={({ field }) => (<FormItem><FormLabel>Bank Info</FormLabel><FormControl><Input placeholder="Bank account details" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="management_entity" render={({ field }) => (<FormItem><FormLabel>Management Entity</FormLabel><FormControl><Input placeholder="e.g., PRO, publisher" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="ipi" render={({ field }) => (<FormItem><FormLabel>IPI</FormLabel><FormControl><Input placeholder="IPI number" {...field} /></FormControl><FormMessage /></FormItem>)} />
          
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
