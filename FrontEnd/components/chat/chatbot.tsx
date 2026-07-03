"use client"

import { useCallback, useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import {
  extractChatReply,
  getApiErrorMessage,
  sendChatMessage,
  type ChatHistoryItem,
} from "@/lib/api"
import {
  clearAllConversations,
  createConversation,
  initializeChatState,
  saveActiveConversationId,
  saveConversations,
  truncateTitle,
  type ChatMessage,
  type Conversation,
} from "@/lib/chat-storage"

export function Chatbot() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const { conversations: loaded, activeId: id } = initializeChatState()
    setConversations(loaded)
    setActiveId(id)
    setMounted(true)
  }, [])

  const activeConversation = conversations.find((c) => c.id === activeId)
  const messages = activeConversation?.messages ?? []

  const persist = useCallback((updated: Conversation[], newActiveId?: string) => {
    setConversations(updated)
    saveConversations(updated)
    if (newActiveId) {
      setActiveId(newActiveId)
      saveActiveConversationId(newActiveId)
    }
  }, [])

  const updateActiveConversation = useCallback(
    (updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) => {
        const updated = prev.map((c) => (c.id === activeId ? updater(c) : c))
        saveConversations(updated)
        return updated
      })
    },
    [activeId]
  )

  const handleNewChat = () => {
    const conv = createConversation()
    persist([conv, ...conversations], conv.id)
    setInput("")
    setError(null)
  }

  const handleSelect = (id: string) => {
    setActiveId(id)
    saveActiveConversationId(id)
    setInput("")
    setError(null)
  }

  const handleDelete = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id)
    if (filtered.length === 0) {
      const fresh = createConversation()
      persist([fresh], fresh.id)
    } else if (id === activeId) {
      persist(filtered, filtered[0].id)
    } else {
      persist(filtered)
    }
    setError(null)
  }

  const handleClearAll = () => {
    const fresh = clearAllConversations()
    setConversations(fresh)
    setActiveId(fresh[0].id)
    setInput("")
    setError(null)
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || !activeId) return

    const userMessage: ChatMessage = { role: "user", content: trimmed }
    const history: ChatHistoryItem[] = messages.map(({ role, content }) => ({
      role,
      content,
    }))

    updateActiveConversation((conv) => ({
      ...conv,
      title: conv.messages.length === 0 ? truncateTitle(trimmed) : conv.title,
      messages: [...conv.messages, userMessage],
      updatedAt: Date.now(),
    }))

    setInput("")
    setError(null)
    setIsLoading(true)

    try {
      const response = await sendChatMessage({ message: trimmed, history })
      const reply = extractChatReply(response)

      updateActiveConversation((conv) => ({
        ...conv,
        messages: [...conv.messages, { role: "assistant", content: reply }],
        updatedAt: Date.now(),
      }))
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send message. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex h-full w-full overflow-hidden rounded-lg border border-border bg-background">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <h2 className="truncate text-sm font-medium">
              {activeConversation?.title ?? "New Chat"}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            Model: gpt-4-mini
          </span>
        </header>

        <ChatMessageList messages={messages} isLoading={isLoading} />

        {error && (
          <div className="px-4 pb-2">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
