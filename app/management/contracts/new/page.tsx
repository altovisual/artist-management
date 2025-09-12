"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

const formSchema = z.object({
  work_id: z.string({
    required_error: "Please select a work.",
  }),
  template_id: z.string({
    required_error: "Please select a template.",
  }),
  status: z.string().optional(), // Added status
  internal_reference: z.string().optional(),
  signing_location: z.string().optional(),
  additional_notes: z.string().optional(),
  publisher: z.string().optional(),
  publisher_percentage: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().optional()
  ),
  co_publishers: z.string().optional(),
  publisher_admin: z.string().optional(),
  participants: z.array(
    z.object({
      id: z.string(),
      role: z.string().min(2, { message: "Role must be at least 2 characters." }),
      percentage: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().optional()
      ),
    })
  ),
});

export default function NewContractPage() {
  const router = useRouter();
  const [works, setWorks] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [allParticipants, setAllParticipants] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false); // State to store admin status

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "draft",
      internal_reference: "",
      signing_location: "",
      additional_notes: "",
      publisher: "",
      publisher_percentage: undefined,
      co_publishers: "",
      publisher_admin: "",
      participants: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const workId = form.watch("work_id");

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.role !== 'admin') {
        redirect('/management/contracts'); // Redirect if not admin
      } else {
        setIsAdmin(true);
      }
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [worksRes, templatesRes, participantsRes] = await Promise.all([
        fetch('/api/works', { cache: 'no-store' }),
        fetch('/api/templates', { cache: 'no-store' }),
        fetch('/api/participants', { cache: 'no-store' }),
      ]);

      if (!worksRes.ok || !templatesRes.ok || !participantsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const worksData = await worksRes.json();
      const templatesData = await templatesRes.json();
      const participantsData = await participantsRes.json();

      setWorks(worksData);
      setTemplates(templatesData);
      setAllParticipants(participantsData);
    }
    if (isAdmin) { // Only fetch data if admin
      fetchData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (workId) {
      async function getWorkParticipants() {
        const res = await fetch(`/api/works/${workId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.participants && data.participants.length > 0) {
            const workParticipants = data.participants.map((p: any) => ({ id: p.id, role: "", percentage: undefined }));
            replace(workParticipants);
          } else {
            replace([]);
          }
        }
      }
      getWorkParticipants();
    }
  }, [workId, replace]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/management/contracts");
    } else {
      // Handle error
      console.error("Failed to create contract");
    }
  }

  if (!isAdmin) {
    return null; // Or a loading spinner, or an access denied message
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Contract</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="work_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a work" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {works.map((work) => (
                      <SelectItem key={work.id} value={work.id}>
                        {work.name}
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
            name="template_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.type} - v{template.version}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The current status of the contract (e.g., draft, sent, signed).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="internal_reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal Reference</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  An internal reference number for the contract.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="signing_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signing Location</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The city/country where the contract is signed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additional_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea className="resize-y" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Any additional notes or optional clauses for the contract.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="publisher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publisher</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The name of the publisher.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="publisher_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publisher Percentage</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The percentage of participation for the publisher.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="co_publishers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Co-Publishers</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Names of any co-publishers (if applicable).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="publisher_admin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publisher Admin</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The administrator of the publisher (e.g., Merlin).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <h3 className="text-lg font-medium">Participants</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-4 mt-2">
                <FormField
                  control={form.control}
                  name={`participants.${index}.id`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a participant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allParticipants.map((participant) => (
                            <SelectItem key={participant.id} value={participant.id}>
                              {participant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`participants.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Role" {...field} value={field.value ?? ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`participants.${index}.percentage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" placeholder="Percentage" {...field} value={field.value ?? ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" variant="destructive" onClick={() => remove(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ id: "", role: "", percentage: undefined })}
            >
              Add Participant
            </Button>
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
