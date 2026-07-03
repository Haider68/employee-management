"use client"

import { useEffect, useRef } from "react"
import { Bot, Loader2, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ChatMarkdown } from "@/components/chat/chat-markdown"
import type { ChatMessage } from "@/lib/chat-storage"

type ChatMessageListProps = {
  messages: ChatMessage[]
  isLoading: boolean
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  const isBot = role === "assistant"
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isBot
          ? "bg-gradient-to-br from-sky-500 to-indigo-500 text-white"
          : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
      )}
    >
      {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
    </div>
  )
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  return (
    <ScrollArea className="flex-1 px-4 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
              <Bot className="h-6 w-6" />
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Hello! I&apos;m your AI assistant. Ask me anything about employees,
              attendance, leave, projects, or salary.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Avatar role={msg.role} />
            <div
              className={cn(
                "max-w-[75%] rounded-xl px-4 py-3",
                msg.role === "user"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
                  : "bg-muted text-foreground"
              )}
            >
              {msg.role === "assistant" ? (
                <ChatMarkdown content={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <Avatar role="assistant" />
            <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
