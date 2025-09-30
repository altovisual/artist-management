'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { useChat } from '@/hooks/use-chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ChatWindowProps {
  conversationId: string
  onBack: () => void
}

const ChatWindowComponent = ({ conversationId, onBack }: ChatWindowProps) => {
  const {
    messages,
    conversations,
    typingUsers,
    currentUserId,
    isSending,
    sendMessage,
    handleTyping
  } = useChat(conversationId)

  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Obtener conversación actual
  const conversation = conversations.find(c => c.id === conversationId)
  const displayName = conversation?.type === 'direct'
    ? conversation.other_user?.name || 'Unknown User'
    : conversation?.name || 'Group Chat'
  const displayAvatar = conversation?.type === 'direct'
    ? conversation.other_user?.avatar
    : undefined

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus en input al montar
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Enviar mensaje
  const handleSend = async () => {
    if (!messageInput.trim() || isSending) return

    const content = messageInput
    setMessageInput('')
    
    try {
      await sendMessage(content)
    } catch (err) {
      console.error('Error sending message:', err)
      setMessageInput(content) // Restaurar mensaje si falla
    }
  }

  // Manejar Enter para enviar
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Indicador de escritura
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
    if (e.target.value) {
      handleTyping(conversationId)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-9 w-9">
          <AvatarImage src={displayAvatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm font-medium">
            {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{displayName}</p>
          {typingUsers.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {typingUsers[0].name} is typing...
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId
              const showAvatar = !isOwn && (
                index === 0 || 
                messages[index - 1].sender_id !== message.sender_id
              )
              const showName = !isOwn && showAvatar

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Avatar (solo para mensajes de otros) */}
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                            {message.sender?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8" />
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={cn(
                    "flex flex-col max-w-[70%]",
                    isOwn && "items-end"
                  )}>
                    {showName && (
                      <span className="text-xs text-muted-foreground mb-1 px-1">
                        {message.sender?.name}
                      </span>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 break-words",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 bg-white/50 dark:bg-gray-800/50"
          />
          <Button
            onClick={handleSend}
            disabled={!messageInput.trim() || isSending}
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Export memoized version
export const ChatWindow = memo(ChatWindowComponent)
