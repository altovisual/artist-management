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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  type: z.string().min(2, {
    message: "Type must be at least 2 characters.",
  }),
  language: z.string().min(2, {
    message: "Language must be at least 2 characters.",
  }),
  template_html: z.string().min(10, {
    message: "Template HTML must be at least 10 characters.",
  }),
  version: z.string().min(1, {
    message: "Version is required.",
  }),
  jurisdiction: z.string().optional(),
});

export default function NewTemplatePage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "contract",
      language: "es",
      template_html: "",
      version: "1.0",
      jurisdiction: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log('Submitting template:', values);
      
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      if (res.ok) {
        const data = await res.json();
        console.log('Template created successfully:', data);
        router.push("/management/templates");
      } else {
        const errorText = await res.text();
        console.error("Error response text:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        console.error("Failed to create template:", errorData);
        alert(`Error (${res.status}): ${errorData.error || errorData.details || 'Failed to create template'}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Template</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., recording_agreement" {...field} />
                </FormControl>
                <FormDescription>
                  The type of the template.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., en, es" {...field} />
                </FormControl>
                <FormDescription>
                  The language of the template.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="template_html"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template HTML</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="<h1>Template</h1>"
                    className="resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The HTML content of the template.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Version</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 1.0" {...field} />
                </FormControl>
                <FormDescription>
                  The version of the template.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jurisdiction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jurisdiction (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Colombia, Mexico" {...field} />
                </FormControl>
                <FormDescription>
                  The jurisdiction or country for this template.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create Template</Button>
        </form>
      </Form>
    </div>
  );
}
