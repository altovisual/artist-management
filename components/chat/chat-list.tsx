'use client'

import { useState, useEffect, memo } from 'react'
import { useChat } from '@/hooks/use-chat'
import { ChatWindow } from './chat-window'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Search, Plus, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ChatListProps {
  initialUserId?: string | null
}

const ChatListComponent = ({ initialUserId }: ChatListProps = {}) => {
  const { conversations, isLoading, createDirectConversation } = useChat()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Si hay un userId inicial, crear/abrir conversación automáticamente
  useEffect(() => {
    console.log('ChatList initialUserId:', initialUserId)
    if (initialUserId && !isCreatingConversation && !selectedConversationId) {
      console.log('Creating conversation with:', initialUserId)
      setIsCreatingConversation(true)
      createDirectConversation(initialUserId).then((convId) => {
        console.log('Conversation created/found:', convId)
        if (convId) {
          setSelectedConversationId(convId)
        }
        setIsCreatingConversation(false)
      }).catch((err) => {
        console.error('Error creating conversation:', err)
        setIsCreatingConversation(false)
      })
    }
  }, [initialUserId])

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchQuery.toLowerCase()
    const name = conv.type === 'direct' 
      ? conv.other_user?.name || 'Unknown'
      : conv.name || 'Group Chat'
    
    return name.toLowerCase().includes(searchLower) ||
           conv.last_message?.content.toLowerCase().includes(searchLower)
  })

  // Si hay una conversación seleccionada, mostrar ventana de chat
  if (selectedConversationId) {
    return (
      <ChatWindow
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
      />
    )
  }

  // Vista de lista de conversaciones
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Messages</h3>
          {conversations.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="New conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white/50 dark:bg-gray-800/50"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? 'Try a different search' : 'Start a conversation with a team member'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {filteredConversations.map((conversation) => {
              const displayName = conversation.type === 'direct'
                ? conversation.other_user?.name || 'Unknown User'
                : conversation.name || 'Group Chat'
              
              const displayAvatar = conversation.type === 'direct'
                ? conversation.other_user?.avatar
                : undefined

              const lastMessage = conversation.last_message
              const hasUnread = conversation.unread_count > 0

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left",
                    hasUnread && "bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={displayAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium">
                        {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">
                          {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        "text-sm truncate",
                        hasUnread ? "font-semibold text-gray-900 dark:text-gray-100" : "font-medium text-gray-700 dark:text-gray-300"
                      )}>
                        {displayName}
                      </p>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className={cn(
                        "text-xs truncate",
                        hasUnread ? "text-gray-700 dark:text-gray-300 font-medium" : "text-muted-foreground"
                      )}>
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Export memoized version
export const ChatList = memo(ChatListComponent)
