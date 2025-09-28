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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  type: z.enum(["single", "album", "ep", "mixtape"], {
    required_error: "Please select a work type.",
  }),
  artist_id: z.string({
    required_error: "Please select an artist.",
  }),
  alternative_title: z.string().optional(),
  iswc: z.string().optional(),
});

export default function NewWorkPage() {
  const router = useRouter();
  const [artists, setArtists] = useState<any[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "single",
      alternative_title: "",
      iswc: "",
    },
  });

  useEffect(() => {
    async function getArtists() {
      const res = await fetch('/api/artists', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch artists');
      }
      const data = await res.json();
      setArtists(data);
    }
    getArtists();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch("/api/works", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        router.push("/management/works");
      } else {
        const errorText = await res.text();
        console.error("Failed to create work:", res.status, res.statusText, errorText);
        // You could also show a toast or alert here
      }
    } catch (error) {
      console.error("Error creating work:", error);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Work</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Work's name" {...field} />
                </FormControl>
                <FormDescription>
                  The title of the work.
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="mixtape">Mixtape</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of the work.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="artist_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artist</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an artist" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The main artist of the work.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alternative_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternative Title</FormLabel>
                <FormControl>
                  <Input placeholder="Alternative title (if applicable)" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  An alternative title for the work.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iswc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ISWC</FormLabel>
                <FormControl>
                  <Input placeholder="ISWC code (if applicable)" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  The International Standard Musical Work Code.
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
