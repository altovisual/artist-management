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
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const formSchema = z.object({
  work_id: z.string({
    required_error: "Please select a work.",
  }),
  template_id: z.string({
    required_error: "Please select a template.",
  }),
  status: z.string().optional(),
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

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [works, setWorks] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [allParticipants, setAllParticipants] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "",
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
    fetchData();
  }, []);

  useEffect(() => {
    if (id) {
      async function getContract() {
        const res = await fetch(`/api/contracts/${id}`);
        if (res.ok) {
          const data = await res.json();
          form.reset({
            ...data,
            template_id: data.template_id.toString(),
            publisher_percentage: data.publisher_percentage !== null ? Number(data.publisher_percentage) : undefined,
            // Convert nulls to empty strings for optional text fields
            internal_reference: data.internal_reference || "",
            signing_location: data.signing_location || "",
            additional_notes: data.additional_notes || "",
            publisher: data.publisher || "",
            co_publishers: data.co_publishers || "",
            publisher_admin: data.publisher_admin || "",
            status: data.status || "", // Ensure status is also handled
          });
          const contractParticipants = data.participants.map((p: any) => ({
            id: p.id,
            role: p.role || "", // Ensure role is also handled
            percentage: p.percentage !== null ? Number(p.percentage) : undefined,
          }));
          replace(contractParticipants);
        }
      }
      getContract();
    }
  }, [id, form, replace]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/management/contracts");
    } else {
      // Handle error
      console.error("Failed to update contract");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Contract</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="work_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
