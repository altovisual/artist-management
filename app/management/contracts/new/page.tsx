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
import { LocationSelector } from "@/components/contracts/LocationSelector";
import { MAJOR_PUBLISHERS, PUBLISHER_ADMINS, CONTRACT_STATUS_OPTIONS, PERCENTAGE_PRESETS } from "@/lib/contract-data";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

const participantRoles = z.enum(["ARTISTA", "PRODUCTOR", "COMPOSITOR", "MANAGER", "LAWYER"]);
const participantRoleOptions = ["ARTISTA", "PRODUCTOR", "COMPOSITOR", "MANAGER", "LAWYER"] as const;

const formSchema = z.object({
  work_id: z.string({
    required_error: "Por favor seleccione una obra.",
  }),
  template_id: z.string({
    required_error: "Por favor seleccione una plantilla.",
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
      id: z.string().min(1, { message: "Debe seleccionar un participante." }),
      role: participantRoles.optional(),
      percentage: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number({ required_error: "El porcentaje es requerido." }).min(0, "El porcentaje no puede ser negativo.").max(100, "El porcentaje no puede ser mayor a 100.")
      ),
    })
  ),
});

export default function NewContractPage() {
  const router = useRouter();
  const [works, setWorks] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [allParticipants, setAllParticipants] = useState<any[]>([]);
  const [participantsDetails, setParticipantsDetails] = useState<Map<string, any>>(new Map()); // Store full participant details
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
      
      // Store participant details in a Map for quick lookup
      const detailsMap = new Map();
      participantsData.forEach((p: any) => {
        detailsMap.set(p.id, p);
      });
      setParticipantsDetails(detailsMap);
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
            // Precargar participantes con información completa desde el Map
            const workParticipants = data.participants.map((p: any) => {
              const participantDetails = participantsDetails.get(p.id);
              return {
                id: p.id,
                role: p.role || undefined, // Usar rol de la obra si existe
                percentage: p.percentage || undefined, // Usar porcentaje de la obra si existe
                // Información adicional para mostrar (no se envía al backend)
                _name: participantDetails?.name || p.name,
                _email: participantDetails?.email || p.email,
                _phone: participantDetails?.phone || p.phone
              };
            });
            replace(workParticipants);
          } else {
            replace([]);
          }
        }
      }
      getWorkParticipants();
    }
  }, [workId, replace, participantsDetails]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('📤 Enviando datos del contrato:', values);
    
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Contrato creado exitosamente:', data);
        router.push("/management/contracts");
      } else {
        // Handle error
        const errorData = await res.json();
        console.error("❌ Error del servidor:", errorData);
        
        // Mostrar mensaje de error al usuario
        alert(`Error al crear contrato: ${errorData.error || 'Error desconocido'}\n${errorData.details || ''}`);
      }
    } catch (e) {
      console.error("❌ Error de red o parsing:", e);
      alert('Error de conexión. Por favor verifica tu conexión a internet e intenta de nuevo.');
    }
  }

  if (!isAdmin) {
    return null; // Or a loading spinner, or an access denied message
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header mejorado */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">📄 Crear Nuevo Contrato</h1>
          <p className="text-muted-foreground">
            Complete el formulario con la información del contrato. Los campos marcados con * son obligatorios.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">💡 Consejos para completar el formulario:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Use los <strong>dropdowns</strong> para seleccionar opciones predefinidas</li>
                <li>Los <strong>badges de porcentaje</strong> permiten asignar valores rápidamente</li>
                <li>El <strong>total de porcentajes</strong> debe sumar exactamente 100%</li>
                <li>Toda la <strong>información del participante</strong> se muestra automáticamente al seleccionarlo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Sección 1: Información Básica */}
          <div className="space-y-6 p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-2 pb-4 border-b">
              <span className="text-2xl">📋</span>
              <h2 className="text-xl font-semibold">Información Básica del Contrato</h2>
            </div>
            
          <FormField
            control={form.control}
            name="work_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Obra Musical *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una obra" />
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
                      <SelectValue placeholder="Seleccione una plantilla" />
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
                <FormLabel>Estado del Contrato</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONTRACT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex flex-col">
                          <span>{status.label}</span>
                          <span className="text-xs text-muted-foreground">{status.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Estado actual del contrato en el proceso de firma.
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
                <FormLabel>Referencia Interna</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value ?? ""} 
                    placeholder="Ej: CONT-2025-001"
                  />
                </FormControl>
                <FormDescription>
                  Número de referencia interno para identificar el contrato.
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
                <LocationSelector
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  label="Lugar de Firma"
                  description="Ciudad y país donde se firma el contrato."
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additional_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Adicionales</FormLabel>
                <FormControl>
                  <Textarea className="resize-y min-h-[100px]" {...field} value={field.value ?? ""} placeholder="Cláusulas especiales, condiciones adicionales, etc." />
                </FormControl>
                <FormDescription>
                  Notas adicionales o cláusulas opcionales para el contrato.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          
          {/* Sección 2: Información Editorial */}
          <div className="space-y-6 p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-2 pb-4 border-b">
              <span className="text-2xl">🎵</span>
              <h2 className="text-xl font-semibold">Información Editorial y Publishing</h2>
            </div>
            
          <FormField
            control={form.control}
            name="publisher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Editorial (Publisher)</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    if (value === 'Otro') {
                      field.onChange('');
                    } else {
                      field.onChange(value);
                    }
                  }} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una editorial" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MAJOR_PUBLISHERS.map((publisher) => (
                      <SelectItem key={publisher.value} value={publisher.value}>
                        {publisher.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.value === '' && (
                  <Input 
                    placeholder="Escribe el nombre de la editorial"
                    onChange={(e) => field.onChange(e.target.value)}
                    className="mt-2"
                  />
                )}
                <FormDescription>
                  Editorial que administra los derechos de publicación.
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
                <FormLabel>Administrador de Editorial</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    if (value === 'Otro') {
                      field.onChange('');
                    } else {
                      field.onChange(value);
                    }
                  }} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un administrador" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PUBLISHER_ADMINS.map((admin) => (
                      <SelectItem key={admin.value} value={admin.value}>
                        {admin.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.value === '' && (
                  <Input 
                    placeholder="Escribe el nombre del administrador"
                    onChange={(e) => field.onChange(e.target.value)}
                    className="mt-2"
                  />
                )}
                <FormDescription>
                  Distribuidor o agregador que administra la editorial (ej: Merlin, The Orchard).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

          {/* Sección 3: Participantes */}
          <div className="space-y-6 p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-2 pb-4 border-b">
              <span className="text-2xl">👥</span>
              <h2 className="text-xl font-semibold">Participantes del Contrato</h2>
            </div>
            
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Asignar Participantes y Porcentajes</h3>
              {fields.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    fields.reduce((sum, _, index) => sum + (form.watch(`participants.${index}.percentage`) || 0), 0) === 100
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {fields.reduce((sum, _, index) => sum + (form.watch(`participants.${index}.percentage`) || 0), 0)}%
                  </span>
                </div>
              )}
            </div>
            {form.formState.errors.participants && (
              <p className="text-sm font-medium text-destructive py-2">
                {form.formState.errors.participants.root?.message}
              </p>
            )}
            {fields.map((field, index) => {
              const selectedParticipant = participantsDetails.get(form.watch(`participants.${index}.id`));
              
              return (
              <div key={field.id} className="space-y-3 mt-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name={`participants.${index}.id`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Participante</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Auto-cargar información del participante seleccionado
                            const participant = participantsDetails.get(value);
                            if (participant) {
                              // Aquí podrías pre-llenar el rol si existe en el participante
                              console.log('Participante seleccionado:', participant);
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un participante" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allParticipants.map((participant) => (
                              <SelectItem key={participant.id} value={participant.id}>
                                {participant.name} {participant.email ? `(${participant.email})` : ''}
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
                    name={`participants.${index}.role`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {participantRoleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
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
                    name={`participants.${index}.percentage`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Porcentaje (%)</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <div className="flex flex-wrap gap-1">
                            {PERCENTAGE_PRESETS.map((preset) => (
                              <Badge
                                key={preset.value}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => form.setValue(`participants.${index}.percentage`, preset.value)}
                              >
                                {preset.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end">
                    <Button type="button" variant="destructive" onClick={() => remove(index)} className="min-h-[40px]">
                      Eliminar
                    </Button>
                  </div>
                </div>
                
                {/* Mostrar información del participante seleccionado */}
                {selectedParticipant && (
                  <div className="bg-background/50 rounded-md p-3 text-sm space-y-2">
                    <p className="font-medium text-foreground">📋 Información del Participante:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
                      <p>📧 Email: <span className="text-foreground">{selectedParticipant.email || 'No disponible'}</span></p>
                      <p>📞 Teléfono: <span className="text-foreground">{selectedParticipant.phone || 'No disponible'}</span></p>
                      <p>🏷️ Tipo: <span className="text-foreground">{selectedParticipant.type || 'No especificado'}</span></p>
                      <p>🆔 ID: <span className="text-foreground">{selectedParticipant.id_number || 'No disponible'}</span></p>
                    </div>
                    {selectedParticipant.ipi && (
                      <div className="bg-primary/10 border border-primary/20 rounded-md p-2">
                        <p className="font-semibold text-primary">🎵 IPI: <span className="font-mono">{selectedParticipant.ipi}</span></p>
                        {selectedParticipant.management_entity && (
                          <p className="text-xs text-muted-foreground mt-1">Entidad: {selectedParticipant.management_entity}</p>
                        )}
                      </div>
                    )}
                    {selectedParticipant.artistic_name && (
                      <p>🎤 Nombre Artístico: <span className="text-foreground font-medium">{selectedParticipant.artistic_name}</span></p>
                    )}
                    {(selectedParticipant.address || selectedParticipant.country) && (
                      <p>📍 Ubicación: <span className="text-foreground">{[selectedParticipant.address, selectedParticipant.country].filter(Boolean).join(', ') || 'No disponible'}</span></p>
                    )}
                  </div>
                )}
              </div>
            )})}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ id: "", role: undefined, percentage: 0 })}
            >
              Añadir participante
            </Button>
          </div>
          </div>

          {/* Botón de Submit */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" className="min-w-[200px]">
              ✅ Crear Contrato
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
