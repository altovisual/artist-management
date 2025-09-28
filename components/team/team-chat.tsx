'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
  Minimize2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data para demostración
  const mockMessages = useMemo(() => [
    {
      id: '1',
      content: 'Hey team! How\'s the progress on the landing page?',
      senderId: '1',
      senderName: 'John Smith',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'text' as const,
      isRead: true
    },
    {
      id: '2',
      content: 'Almost done! Just working on the animations now.',
      senderId: '2',
      senderName: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      type: 'text' as const,
      isRead: true
    },
    {
      id: '3',
      content: 'Great! Can you share a preview when ready?',
      senderId: '1',
      senderName: 'John Smith',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      type: 'text' as const,
      isRead: true
    },
    {
      id: '4',
      content: 'Emily Davis joined the project',
      senderId: 'system',
      senderName: 'System',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      type: 'system' as const,
      isRead: true
    },
    {
      id: '5',
      content: 'Hi everyone! Excited to work on this project with you all! 🚀',
      senderId: '4',
      senderName: 'Emily Davis',
      timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      type: 'text' as const,
      isRead: true
    },
    {
      id: '6',
      content: 'Welcome Emily! Looking forward to collaborating.',
      senderId: '2',
      senderName: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      type: 'text' as const,
      isRead: true
    },
    {
      id: '7',
      content: 'I\'ve uploaded the latest design files to the project folder.',
      senderId: '4',
      senderName: 'Emily Davis',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      type: 'text' as const,
      isRead: false
    }
  ], [])

  useEffect(() => {
    setMessages(mockMessages)
  }, [mockMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date(),
      type: 'text' as const,
      isRead: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")

    // Simular respuesta automática después de un delay
    setTimeout(() => {
      const responses = [
        "Thanks for the update!",
        "Looks great! 👍",
        "I'll review this shortly.",
        "Good work team!",
        "Let me know if you need any help."
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const randomMember = teamMembers.filter(m => m.id !== currentUser.id)[
        Math.floor(Math.random() * (teamMembers.length - 1))
      ]

      if (randomMember) {
        const responseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          senderId: randomMember.id,
          senderName: randomMember.name,
          senderAvatar: randomMember.avatar,
          timestamp: new Date(),
          type: 'text' as const,
          isRead: false
        }

        setMessages(prev => [...prev, responseMessage])
      }
    }, 2000 + Math.random() * 3000) // Random delay between 2-5 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const onlineMembers = teamMembers.filter(member => member.isOnline)

  if (!isOpen) return null

  return (
    <Card className={cn("fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-lg z-50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {onlineMembers.slice(0, 3).map(member => (
              <div key={member.id} className="relative">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {projectName ? `${projectName} Team` : 'Team Chat'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {onlineMembers.length} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="p-1">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
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
                  <Avatar className="h-8 w-8 flex-shrink-0">
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
        ))}
        
        {isTyping.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-1">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1">
            <Smile className="h-4 w-4" />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
  )
}
