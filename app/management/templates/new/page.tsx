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
});

export default function NewTemplatePage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      language: "en",
      template_html: "",
      version: "1.0",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/management/templates");
    } else {
      // Handle error
      console.error("Failed to create template");
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
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
