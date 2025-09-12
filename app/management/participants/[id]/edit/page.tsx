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
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  type: z.string().min(2, {
    message: "Type must be at least 2 characters.",
  }),
  id_number: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  bank_info: z.string().optional(),
  artistic_name: z.string().optional(),
  management_entity: z.string().optional(),
  ipi: z.string().optional(),
});

export default function EditParticipantPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      type: "",
      id_number: "",
      address: "",
      country: "",
      phone: "",
      bank_info: "",
      artistic_name: "",
      management_entity: "",
      ipi: "",
    },
  });

  useEffect(() => {
    if (id) {
      async function getParticipant() {
        const res = await fetch(`/api/participants/${id}`);
        if (res.ok) {
          const data = await res.json();
          form.reset({
            ...data,
            id_number: data.id_number || "",
            address: data.address || "",
            country: data.country || "",
            phone: data.phone || "",
            bank_info: data.bank_info || "",
            artistic_name: data.artistic_name || "",
            management_entity: data.management_entity || "",
            ipi: data.ipi || "",
          });
        }
      }
      getParticipant();
    }
  }, [id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch(`/api/participants/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/management/participants");
    } else {
      // Handle error
      console.error("Failed to update participant");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Participant</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Participant's name" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The full name of the participant.
                </FormDescription>
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
                  <Input placeholder="participant@example.com" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The email address of the participant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., artist, producer" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The role of the participant.
                </FormDescription>
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
                  <Input placeholder="Artistic name (if applicable)" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The artistic name of the participant.
                </FormDescription>
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
                  <Input placeholder="ID Number" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Identification number of the participant.
                </FormDescription>
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
                  <Input placeholder="Participant's address" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The physical address of the participant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Participant's country" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The country of residence of the participant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Participant's phone number" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The phone number of the participant.
                </FormDescription>
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
                  <Input placeholder="Participant's bank information" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Bank account details for payments.
                </FormDescription>
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
                  <Input placeholder="Management entity (e.g., PRO)" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Performing Rights Organization or other management entity.
                </FormDescription>
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
                  <Input placeholder="IPI number (if applicable)" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Interested Party Information number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}