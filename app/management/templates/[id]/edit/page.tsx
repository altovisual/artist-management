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
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

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

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      language: "",
      template_html: "",
      version: "",
      jurisdiction: "",
    },
  });

  useEffect(() => {
    if (id) {
      async function getTemplate() {
        const res = await fetch(`/api/templates/${id}`);
        if (res.ok) {
          const data = await res.json();
          console.log('Loaded template data:', data);
          
          // Mapear auco_template_id a template_html para el formulario
          // Asegurar que todos los campos tengan valores no-null
          const formData = {
            type: data.type || '',
            language: data.language || '',
            template_html: data.auco_template_id || data.template_html || '',
            version: data.version || '',
            jurisdiction: data.jurisdiction || ''
          };
          
          console.log('Form data to reset:', formData);
          form.reset(formData);
        }
      }
      getTemplate();
    }
  }, [id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log('Updating template:', values);
      
      const res = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      console.log('Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Template updated successfully:', data);
        router.push("/management/templates");
      } else {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        alert(`Error (${res.status}): ${errorData.error || errorData.details || 'Failed to update template'}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Template</h1>
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
                    className="resize-y min-h-[400px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The HTML content of the template. Use variables like {`{{work.name}}`} and {`{{contract.status}}`}.
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
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">Update Template</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/management/templates')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
