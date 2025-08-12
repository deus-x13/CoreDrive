"use client"

import { useState } from "react"

const TestQualitative = () => {
  const [answer1, setAnswer1] = useState("")
  const [answer2, setAnswer2] = useState("")

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Qualitative Questions Test</h1>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            1. Why did you rank your top 3 motivators this way?
          </label>
          <textarea
            value={answer1}
            onChange={(e) => setAnswer1(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Type your answer here..."
          />
          <p className="text-sm text-gray-500 mt-2">Characters: {answer1.length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            2. What motivator is missing from the list?
          </label>
          <textarea
            value={answer2}
            onChange={(e) => setAnswer2(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Type your answer here..."
          />
          <p className="text-sm text-gray-500 mt-2">Characters: {answer2.length}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium mb-2">Your Answers:</h3>
          <p>
            <strong>Answer 1:</strong> "{answer1}"
          </p>
          <p>
            <strong>Answer 2:</strong> "{answer2}"
          </p>
        </div>

        <button
          onClick={() => {
            alert(`Answer 1: ${answer1}\nAnswer 2: ${answer2}`)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Test Answers
        </button>
      </div>
    </div>
  )
}

export default TestQualitative
