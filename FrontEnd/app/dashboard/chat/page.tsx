import { Chatbot } from "@/components/chat/chatbot"

export const metadata = {
  title: "AI Chat — EMS Pro Admin",
  description: "Chat with the AI assistant for employee management insights.",
}

export default function ChatPage() {
  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] md:-m-6">
      <Chatbot />
    </div>
  )
}
