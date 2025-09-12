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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const formSchema = z.object({
  contract_id: z.string({
    required_error: "Please select a contract.",
  }),
  signer_email: z.string().email({
    message: "Please enter a valid email.",
  }),
});

export default function NewSignaturePage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      signer_email: "",
    },
  });

  useEffect(() => {
    async function getContracts() {
      const res = await fetch('/api/contracts', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch contracts');
      }
      const data = await res.json();
      setContracts(data);
    }
    getContracts();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch("/api/signatures", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/management/signatures");
    } else {
      // Handle error
      console.error("Failed to create signature");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Signature</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="contract_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contract" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        Contract #{contract.id}
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
            name="signer_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signer Email</FormLabel>
                <FormControl>
                  <Input placeholder="signer@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  The email address of the signer.
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
