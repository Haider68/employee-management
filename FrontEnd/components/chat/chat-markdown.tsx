"use client"

import type { ReactNode } from "react"

function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function parseBlock(block: string): ReactNode {
  const lines = block.split("\n").filter((l) => l.trim())

  const isBulletList = lines.every((l) => /^-\s/.test(l.trim()) || l.trim() === "")
  const isNumberedList = lines.every((l) => /^\d+\.\s/.test(l.trim()) || l.trim() === "")

  if (isBulletList && lines.some((l) => /^-\s/.test(l.trim()))) {
    return (
      <ul className="my-1 list-disc space-y-1 pl-5">
        {lines
          .filter((l) => /^-\s/.test(l.trim()))
          .map((l, i) => (
            <li key={i}>{formatInline(l.trim().replace(/^-\s/, ""))}</li>
          ))}
      </ul>
    )
  }

  if (isNumberedList && lines.some((l) => /^\d+\.\s/.test(l.trim()))) {
    return (
      <ol className="my-1 list-decimal space-y-1 pl-5">
        {lines
          .filter((l) => /^\d+\.\s/.test(l.trim()))
          .map((l, i) => (
            <li key={i}>{formatInline(l.trim().replace(/^\d+\.\s/, ""))}</li>
          ))}
      </ol>
    )
  }

  return (
    <p className="my-1 whitespace-pre-wrap">
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {formatInline(line)}
        </span>
      ))}
    </p>
  )
}

export function ChatMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/)

  return (
    <div className="text-sm leading-relaxed">
      {blocks.map((block, i) => (
        <div key={i}>{parseBlock(block)}</div>
      ))}
    </div>
  )
}
