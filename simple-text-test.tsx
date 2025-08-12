"use client"

import { useState } from "react"

const SimpleTextTest = () => {
  const [text, setText] = useState("")
  const [text2, setText2] = useState("")

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Simple Text Input Test</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Test Input 1:</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Type here..."
          />
          <p className="text-sm text-gray-600 mt-2">You typed: {text}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Test Textarea:</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Type your thoughts here..."
          />
          <p className="text-sm text-gray-600 mt-2">Character count: {text2.length}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium mb-2">Current Values:</h3>
          <p>
            <strong>Input 1:</strong> "{text}"
          </p>
          <p>
            <strong>Textarea:</strong> "{text2}"
          </p>
        </div>
      </div>
    </div>
  )
}

export default SimpleTextTest
