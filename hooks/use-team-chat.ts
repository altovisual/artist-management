'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: Date
  type: 'text' | 'file' | 'system'
  isRead: boolean
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  isOnline: boolean
}

export function useTeamChat(projectId?: string, currentUserId?: string, teamMembers: TeamMember[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [typingChannel, setTypingChannel] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!projectId) {
      setMessages([])
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('team_chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedMessages: ChatMessage[] = (data || []).map(msg => {
        const sender = teamMembers.find(m => m.id === msg.sender_id)
        return {
          id: msg.id,
          content: msg.content,
          senderId: msg.sender_id,
          senderName: sender?.name || 'Unknown User',
          senderAvatar: sender?.avatar,
          timestamp: new Date(msg.created_at),
          type: msg.type as 'text' | 'file' | 'system',
          isRead: msg.is_read
        }
      })

      setMessages(formattedMessages)
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, supabase, teamMembers, toast])

  // Send message
  const sendMessage = useCallback(async (content: string, type: 'text' | 'file' | 'system' = 'text') => {
    if (!projectId || !currentUserId || !content.trim()) {
      console.log('Missing required data:', { projectId, currentUserId, content })
      return null
    }

    try {
      console.log('Sending message:', { projectId, currentUserId, content })
      
      const { data, error } = await supabase
        .from('team_chat_messages')
        .insert({
          project_id: projectId,
          sender_id: currentUserId,
          content: content.trim(),
          type,
          is_read: false
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!data) {
        console.error('No data returned from insert')
        throw new Error('No data returned')
      }

      console.log('Message sent successfully:', data)

      // Optimistically add message to local state
      const sender = teamMembers.find(m => m.id === currentUserId)
      const newMessage: ChatMessage = {
        id: data.id,
        content: data.content,
        senderId: data.sender_id,
        senderName: sender?.name || 'You',
        senderAvatar: sender?.avatar,
        timestamp: new Date(data.created_at),
        type: data.type as 'text' | 'file' | 'system',
        isRead: data.is_read
      }

      setMessages(prev => [...prev, newMessage])

      return newMessage
    } catch (error: any) {
      console.error('Error sending message:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })
      
      toast({
        title: 'Error',
        description: error?.message || 'Failed to send message. Please check console for details.',
        variant: 'destructive'
      })
      return null
    }
  }, [projectId, currentUserId, supabase, teamMembers, toast])

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length) return

    try {
      const { error } = await supabase
        .from('team_chat_messages')
        .update({ is_read: true })
        .in('id', messageIds)

      if (error) throw error

      setMessages(prev =>
        prev.map(msg =>
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      )
    } catch (error: any) {
      console.error('Error marking messages as read:', error)
    }
  }, [supabase])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!projectId) return

    fetchMessages()

    console.log('🔌 Setting up realtime subscription for project:', projectId)

    const channel = supabase
      .channel(`team_chat:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_chat_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('📨 New message received via realtime:', payload)
          const newMsg = payload.new
          const sender = teamMembers.find(m => m.id === newMsg.sender_id)
          
          const message: ChatMessage = {
            id: newMsg.id,
            content: newMsg.content,
            senderId: newMsg.sender_id,
            senderName: sender?.name || 'Unknown User',
            senderAvatar: sender?.avatar,
            timestamp: new Date(newMsg.created_at),
            type: newMsg.type as 'text' | 'file' | 'system',
            isRead: newMsg.is_read
          }

          console.log('✅ Adding message to state:', message)

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === message.id)) {
              console.log('⚠️ Duplicate message detected, skipping')
              return prev
            }
            console.log('➕ Adding new message to list')
            return [...prev, message]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'team_chat_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('🔄 Message updated via realtime:', payload)
          const updatedMsg = payload.new
          setMessages(prev =>
            prev.map(msg =>
              msg.id === updatedMsg.id
                ? { ...msg, isRead: updatedMsg.is_read }
                : msg
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'team_chat_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('🗑️ Message deleted via realtime:', payload)
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to realtime channel')
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime subscription timed out')
        }
      })

    return () => {
      console.log('🔌 Unsubscribing from realtime channel')
      channel.unsubscribe()
    }
  }, [projectId, supabase, teamMembers, fetchMessages])

  // Subscribe to typing events and create broadcast channel
  useEffect(() => {
    if (!projectId || !currentUserId) return

    const channel = supabase
      .channel(`typing:${projectId}`, {
        config: {
          broadcast: { self: false }
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        console.log('Received typing event:', payload)
        if (payload.userId !== currentUserId) {
          setTypingUsers(prev => {
            if (!prev.includes(payload.userId)) {
              return [...prev, payload.userId]
            }
            return prev
          })

          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== payload.userId))
          }, 3000)
        }
      })
      .subscribe((status) => {
        console.log('Typing channel status:', status)
        if (status === 'SUBSCRIBED') {
          setTypingChannel(channel)
        }
      })

    return () => {
      channel.unsubscribe()
      setTypingChannel(null)
    }
  }, [projectId, currentUserId, supabase])

  // Broadcast typing status
  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    if (!projectId || !currentUserId || !isTyping || !typingChannel) return

    try {
      console.log('Broadcasting typing status:', { userId: currentUserId })
      
      await typingChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, userName: teamMembers.find(m => m.id === currentUserId)?.name }
      })
    } catch (error) {
      console.error('Error broadcasting typing:', error)
    }
  }, [projectId, currentUserId, typingChannel, teamMembers])

  return {
    messages,
    isLoading,
    typingUsers,
    sendMessage,
    markAsRead,
    broadcastTyping,
    refetch: fetchMessages
  }
}
