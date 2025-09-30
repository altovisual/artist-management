'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  X,
  Minimize2,
  Loader2,
  MessageCircle,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { useTeamChat } from '@/hooks/use-team-chat'

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
  lastSeen?: Date
}

interface TeamChatProps {
  currentUser: TeamMember
  teamMembers: TeamMember[]
  projectId?: string
  projectName?: string
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
  className?: string
}

export function TeamChat({
  currentUser,
  teamMembers,
  projectId,
  projectName,
  isOpen,
  onClose,
  onMinimize,
  className
}: TeamChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Use real chat hook
  const { messages, isLoading, typingUsers, sendMessage, broadcastTyping } = useTeamChat(
    projectId,
    currentUser.id,
    teamMembers
  )

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message = newMessage
    setNewMessage("") // Clear input immediately for better UX
    setShowEmojiPicker(false)

    await sendMessage(message)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    // Broadcast typing status
    if (broadcastTyping) {
      broadcastTyping(true)
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        broadcastTyping(false)
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  // Common emojis
  const commonEmojis = ['👍', '❤️', '😊', '🎉', '🔥', '👏', '✅', '🎵', '🎤', '🎸', '🎹', '🎧']

  // Get typing user names
  const typingUserNames = typingUsers
    .map(userId => teamMembers.find(m => m.id === userId)?.name)
    .filter(Boolean)

  // Filter messages by search query
  const filteredMessages = searchQuery
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages

  const onlineMembers = teamMembers.filter(member => member.isOnline)

  if (!isOpen) return null

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      <Card className={cn(
        "fixed flex flex-col shadow-lg z-50",
        "bottom-0 left-0 right-0 h-[85vh] rounded-b-none",
        "lg:bottom-4 lg:right-4 lg:left-auto lg:w-96 lg:h-[500px] lg:rounded-lg",
        className
      )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {onlineMembers.slice(0, 2).map(member => (
              <div key={member.id} className="relative">
                <Avatar className="h-7 w-7 lg:h-8 lg:w-8 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {projectName ? `${projectName} Team` : 'Team Chat'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {onlineMembers.length} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 lg:gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 hidden lg:inline-flex">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 hidden lg:inline-flex">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 hidden lg:inline-flex" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'} found
            </p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4 bg-muted/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          filteredMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.senderId === currentUser.id && "flex-row-reverse"
            )}
          >
            {message.type === 'system' ? (
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {message.content}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </p>
              </div>
            ) : (
              <>
                {message.senderId !== currentUser.id && (
                  <Avatar className="h-7 w-7 lg:h-8 lg:w-8 flex-shrink-0">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="text-xs">
                      {message.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "flex-1 max-w-[70%]",
                  message.senderId === currentUser.id && "text-right"
                )}>
                  {message.senderId !== currentUser.id && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {message.senderName}
                    </p>
                  )}
                  
                  <div className={cn(
                    "inline-block px-3 py-2 rounded-lg text-sm",
                    message.senderId === currentUser.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    {message.content}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    {message.senderId === currentUser.id && (
                      <span className="ml-1">
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        ))
        )}
        
        {typingUserNames.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{typingUserNames.join(', ')} {typingUserNames.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 lg:p-4 bg-background relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-3 mb-2 bg-background border rounded-lg shadow-lg p-3 z-10">
            <div className="grid grid-cols-6 gap-2">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl hover:bg-muted rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 lg:gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 hidden sm:inline-flex"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="p-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
    </>
  )
}
