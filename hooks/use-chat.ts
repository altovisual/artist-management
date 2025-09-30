'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useTeamReal } from './use-team-real'

// Interfaces
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  metadata?: any
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  // Datos del remitente (join)
  sender?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  created_by: string
  created_at: string
  updated_at: string
  last_message?: {
    id: string
    content: string
    sender_id: string
    created_at: string
  }
  participants?: Array<{
    user_id: string
    joined_at: string
    is_active: boolean
  }>
  unread_count: number
  // Datos del otro usuario (para chats directos)
  other_user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface TypingUser {
  user_id: string
  name: string
}

export function useChat(conversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Obtener datos de team members
  const { teamMembers } = useTeamReal()

  // Obtener usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase])

  // Obtener lista de conversaciones (OPTIMIZADO)
  const fetchConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener conversaciones básicas
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(user_id, is_active)
        `)
        .eq('conversation_participants.user_id', user.id)
        .eq('conversation_participants.is_active', true)
        .order('updated_at', { ascending: false })
        .limit(20) // Limitar a 20 conversaciones más recientes

      if (convError) throw convError

      // Mapear conversaciones con datos básicos (sin queries adicionales)
      const conversationsBasic = (convData || []).map(conv => {
        // Para chats directos, buscar el otro usuario en teamMembers (sin query)
        let otherUser = null
        if (conv.type === 'direct') {
          // Obtener el otro participante del array ya cargado
          const otherUserId = conv.conversation_participants.find((p: any) => p.user_id !== user.id)?.user_id
          if (otherUserId) {
            const member = teamMembers.find(m => m.id === otherUserId)
            if (member) {
              otherUser = {
                id: member.id,
                name: member.name,
                email: member.email,
                avatar: member.avatar
              }
            }
          }
        }

        return {
          ...conv,
          last_message: undefined, // Se cargará bajo demanda
          participants: conv.conversation_participants || [],
          unread_count: 0, // Se calculará después si es necesario
          other_user: otherUser || undefined
        }
      })

      setConversations(conversationsBasic)
    } catch (err: any) {
      console.error('Error fetching conversations:', err)
      setError(err.message)
    }
  }, [supabase, teamMembers])

  // Obtener mensajes de una conversación
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100) // Últimos 100 mensajes

      if (error) throw error

      // Agregar datos del sender desde teamMembers
      const messagesWithSender = (data || []).map(msg => {
        const sender = teamMembers.find(m => m.id === msg.sender_id)
        return {
          ...msg,
          sender: sender ? {
            id: sender.id,
            name: sender.name,
            email: sender.email,
            avatar: sender.avatar
          } : undefined
        }
      })

      setMessages(messagesWithSender)
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message)
    }
  }, [supabase, teamMembers])

  // Crear conversación directa
  const createDirectConversation = async (otherUserId: string): Promise<string | null> => {
    try {
      // Usar función de Supabase para crear o obtener conversación existente
      const { data, error } = await supabase.rpc('create_direct_conversation', {
        other_user_id: otherUserId
      })

      if (error) throw error

      await fetchConversations()
      return data
    } catch (err: any) {
      console.error('Error creating conversation:', err)
      setError(err.message)
      return null
    }
  }

  // Enviar mensaje con optimistic update
  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!conversationId || !content.trim()) return

    setIsSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Optimistic update: agregar mensaje inmediatamente
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        type,
        metadata: null,
        is_edited: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: teamMembers.find(m => m.id === user.id) ? {
          id: user.id,
          name: teamMembers.find(m => m.id === user.id)!.name,
          email: teamMembers.find(m => m.id === user.id)!.email,
          avatar: teamMembers.find(m => m.id === user.id)!.avatar
        } : undefined
      }

      // Agregar mensaje optimista inmediatamente
      setMessages(prev => [...prev, optimisticMessage])

      // Enviar mensaje real
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          type
        })
        .select()
        .single()

      if (error) {
        // Remover mensaje optimista si falla
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
        throw error
      }

      // Reemplazar mensaje optimista con el real
      setMessages(prev => prev.map(m => 
        m.id === optimisticMessage.id ? { ...data, sender: optimisticMessage.sender } : m
      ))

      // Actualizar last_read_at del usuario actual
      await markAsRead(conversationId)

      return data
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(err.message)
      throw err
    } finally {
      setIsSending(false)
    }
  }

  // Marcar conversación como leída
  const markAsRead = async (convId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', convId)
        .eq('user_id', user.id)

      if (error) throw error

      // Actualizar contador local
      setConversations(prev => 
        prev.map(conv => 
          conv.id === convId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      )
    } catch (err: any) {
      console.error('Error marking as read:', err)
    }
  }

  // Indicador de escritura
  const setTyping = async (convId: string, isTyping: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isTyping) {
        await supabase
          .from('typing_indicators')
          .upsert({
            conversation_id: convId,
            user_id: user.id,
            is_typing: true,
            updated_at: new Date().toISOString()
          })
      } else {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('conversation_id', convId)
          .eq('user_id', user.id)
      }
    } catch (err: any) {
      console.error('Error setting typing status:', err)
    }
  }

  // Debounced typing indicator
  const handleTyping = useCallback((convId: string) => {
    setTyping(convId, true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(convId, false)
    }, 3000)
  }, [])

  // Suscripciones en tiempo real
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase.channel(`conversation:${conversationId}`)

    // Suscribirse a nuevos mensajes (con actualización optimista)
    channel
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload)
          const newMessage = payload.new as any
          
          // Agregar sender info desde teamMembers
          const sender = teamMembers.find(m => m.id === newMessage.sender_id)
          const messageWithSender = {
            ...newMessage,
            sender: sender ? {
              id: sender.id,
              name: sender.name,
              email: sender.email,
              avatar: sender.avatar
            } : undefined
          }
          
          // Agregar mensaje inmediatamente sin esperar fetch
          setMessages(prev => {
            // Evitar duplicados
            if (prev.find(m => m.id === newMessage.id)) return prev
            return [...prev, messageWithSender]
          })
        }
      )
      // Suscribirse a typing indicators
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const typingUserId = (payload.new as any).user_id
            if (typingUserId !== currentUserId) {
              // Obtener nombre del usuario desde teamMembers
              const member = teamMembers.find(m => m.id === typingUserId)

              if (member) {
                setTypingUsers(prev => {
                  const exists = prev.find(u => u.user_id === typingUserId)
                  if (!exists) {
                    return [...prev, { user_id: typingUserId, name: member.name }]
                  }
                  return prev
                })
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const typingUserId = (payload.old as any).user_id
            setTypingUsers(prev => prev.filter(u => u.user_id !== typingUserId))
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId, currentUserId, supabase, fetchMessages, teamMembers])

  // Cargar datos iniciales (solo una vez)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await fetchConversations()
        if (conversationId) {
          await fetchMessages(conversationId)
          await markAsRead(conversationId)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, []) // Solo cargar una vez al montar

  // Efecto separado para cuando cambia conversationId
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
      markAsRead(conversationId)
    }
  }, [conversationId])

  return {
    // Datos
    conversations,
    messages,
    currentConversation,
    typingUsers,
    currentUserId,
    
    // Estados
    isLoading,
    isSending,
    error,
    
    // Acciones
    createDirectConversation,
    sendMessage,
    markAsRead,
    handleTyping,
    refreshConversations: fetchConversations,
    refreshMessages: () => conversationId && fetchMessages(conversationId)
  }
}
