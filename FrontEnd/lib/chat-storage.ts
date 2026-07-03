export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: number
}

const CONVERSATIONS_KEY = "ems-chat-conversations"
const ACTIVE_ID_KEY = "ems-chat-active-id"

export function createConversation(title = "New Chat"): Conversation {
  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
    updatedAt: Date.now(),
  }
}

export function truncateTitle(text: string, maxLength = 40): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength)}...`
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Conversation[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
}

export function loadActiveConversationId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACTIVE_ID_KEY)
}

export function saveActiveConversationId(id: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ACTIVE_ID_KEY, id)
}

export function clearAllConversations(): Conversation[] {
  const fresh = [createConversation()]
  saveConversations(fresh)
  saveActiveConversationId(fresh[0].id)
  return fresh
}

export function initializeChatState(): {
  conversations: Conversation[]
  activeId: string
} {
  let conversations = loadConversations()
  if (conversations.length === 0) {
    conversations = [createConversation()]
    saveConversations(conversations)
  }

  const storedActiveId = loadActiveConversationId()
  const activeId =
    storedActiveId && conversations.some((c) => c.id === storedActiveId)
      ? storedActiveId
      : conversations[0].id

  saveActiveConversationId(activeId)
  return { conversations, activeId }
}
