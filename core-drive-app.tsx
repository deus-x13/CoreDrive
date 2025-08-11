"use client"

import { useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, BarChart3, Users, ArrowUp, ArrowDown, Crown, GripVertical } from "lucide-react"

const CoreDriveApp = () => {
  const [currentStep, setCurrentStep] = useState("welcome")
  const [flowType, setFlowType] = useState(null)
  const [teamCode, setTeamCode] = useState("")
  const [email, setEmail] = useState("")
  const [surveyData, setSurveyData] = useState({
    rankings: [],
    qualitative: {},
    demographics: {},
  })

  const motivators = [
    "Autonomy",
    "Belonging",
    "Collaboration",
    "Dependability",
    "Flexibility",
    "Growth",
    "Impact",
    "Psychological Safety",
    "Purpose",
    "Recognition",
  ]

  const motivatorDefinitions = {
    Autonomy: "Having control over how, when, and where you work",
    Belonging: "Feeling accepted and valued as part of the team",
    Collaboration: "Working together effectively with others",
    Dependability: "Having reliable systems, processes, and people",
    Flexibility: "Having options in work arrangements and approaches",
    Growth: "Opportunities to learn, develop, and advance",
    Impact: "Making a meaningful difference through your work",
    "Psychological Safety": "Feeling safe to speak up and be yourself",
    Purpose: "Understanding why your work matters",
    Recognition: "Being acknowledged for your contributions",
  }

  const intrinsicMotivators = ["Purpose", "Growth", "Autonomy", "Impact"]
  const extrinsicMotivators = [
    "Belonging",
    "Collaboration",
    "Dependability",
    "Flexibility",
    "Psychological Safety",
    "Recognition",
  ]
  const generationalGroups = ["Gen Z", "Millennial", "Gen X", "Baby Boomer"]

  const qualitativeQuestions = [
    {
      id: "top3_reasoning",
      question: "Please share why you have ranked your top 3 motivators in the way you did.",
    },
    {
      id: "missing_motivator",
      question:
        "Is there a motivator that is important to you but was not included in the list above? If yes, please describe it and where it would rank.",
    },
    {
      id: "current_role_alignment",
      question: "How well do your top motivators show up in your current role?",
    },
    {
      id: "recent_changes",
      question:
        "Has anything changed in your role, team, or environment in the past 3 months that affected how motivated you feel?",
    },
    {
      id: "improvement_suggestions",
      question: "What could help you feel more motivated at work right now?",
    },
  ]

  // Arrow button functions (keeping as backup)
  const moveItem = (fromIndex, direction) => {
    const newRankings = [...surveyData.rankings]
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1

    if (toIndex >= 0 && toIndex < newRankings.length) {
      const item = newRankings[fromIndex]
      newRankings.splice(fromIndex, 1)
      newRankings.splice(toIndex, 0, item)
      setSurveyData((prev) => ({ ...prev, rankings: newRankings }))
    }
  }

  const initializeRankings = () => {
    const shuffled = [...motivators].sort(() => Math.random() - 0.5)
    setSurveyData((prev) => ({ ...prev, rankings: shuffled }))
    setCurrentStep("ranking")
  }

  const updateQualitative = useCallback((questionId, value) => {
    setSurveyData((prev) => ({
      ...prev,
      qualitative: { ...prev.qualitative, [questionId]: value },
    }))
  }, [])

  const updateDemographics = (field, value) => {
    setSurveyData((prev) => ({
      ...prev,
      demographics: { ...prev.demographics, [field]: value },
    }))
  }

  const generateRandomTeamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const generateIndividualReport = () => {
    const top3 = surveyData.rankings.slice(0, 3)
    const intrinsicCount = top3.filter((m) => intrinsicMotivators.includes(m)).length
    const extrinsicCount = top3.filter((m) => extrinsicMotivators.includes(m)).length

    const insights = []
    if (top3.includes("Purpose")) {
      insights.push(
        "You are driven by meaning and impact. Seek opportunities to connect your daily work to larger organizational goals.",
      )
    }
    if (top3.includes("Autonomy")) {
      insights.push(
        "Independence is crucial for you. Consider discussing flexible work arrangements or decision-making authority with your manager.",
      )
    }
    if (top3.includes("Growth")) {
      insights.push(
        "Learning and development energize you. Actively pursue new challenges, skills, and career advancement opportunities.",
      )
    }
    if (top3.includes("Collaboration")) {
      insights.push(
        "You thrive in team environments. Look for projects that involve cross-functional work and group problem-solving.",
      )
    }
    if (top3.includes("Recognition")) {
      insights.push(
        "Acknowledgment fuels your motivation. Share your achievements with your manager and seek feedback regularly.",
      )
    }

    return {
      topMotivators: top3,
      motivationProfile:
        intrinsicCount > extrinsicCount
          ? "Intrinsically Motivated"
          : extrinsicCount > intrinsicCount
            ? "Extrinsically Motivated"
            : "Balanced",
      intrinsicCount,
      extrinsicCount,
      insights,
    }
  }

  const WelcomeScreen = () => (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Core Drive Framework</h1>
      <p className="text-xl text-gray-600 mb-8">
        Discover what motivates you at work and help create environments that align with those drivers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="text-blue-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Individual Assessment</h3>
          <p className="text-blue-800 text-sm mb-4">
            Get personal insights about your work motivators and receive an individual report.
          </p>
          <button
            onClick={() => {
              setFlowType("individual")
              initializeRankings()
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Individual Survey
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <Users className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-3">Team Assessment</h3>
          <p className="text-green-800 text-sm mb-4">
            Join your team assessment to see both individual and team-level insights.
          </p>
          <button
            onClick={() => setCurrentStep("team-setup")}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Join Team Survey
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">What You Will Do:</h3>
        <ul className="text-left text-gray-600 space-y-2">
          <li>• Rank 10 core workplace motivators by importance to you</li>
          <li>• Answer reflection questions about your work experience</li>
          <li>• Provide basic demographic information</li>
          <li>• Receive personalized insights and recommendations</li>
        </ul>
        <p className="text-sm text-gray-500 mt-4">
          Survey takes approximately 8-10 minutes. All responses are confidential.
        </p>
      </div>
    </div>
  )

  const TeamSetupScreen = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCurrentStep("welcome")} className="text-gray-600 hover:text-gray-800">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Team Assessment Setup</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Enter Team Code</h3>
        <p className="text-gray-600 mb-4">
          If your team leader has provided you with a team code, enter it below. If you are starting a new team
          assessment, leave this blank and we will generate a code for you.
        </p>
        <input
          type="text"
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
          placeholder="Enter team code (optional)"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
          maxLength={6}
        />
        {!teamCode && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
            <strong>Starting a new team assessment?</strong> We will generate a unique team code that you can share with
            your team members.
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Work Email Address</h3>
        <p className="text-gray-600 mb-4">
          Please provide your work email address to ensure team results are properly grouped and to receive your
          reports.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.name@company.com"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep("welcome")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          onClick={() => {
            if (!email.includes("@") || !email.includes(".")) {
              alert("Please enter a valid work email address")
              return
            }
            if (!teamCode) {
              setTeamCode(generateRandomTeamCode())
            }
            setFlowType("team")
            initializeRankings()
          }}
          disabled={!email}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Continue
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )

  const RankingStep = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Rank Your Work Motivators</h2>
      <p className="text-gray-600 mb-8">
        Drag and drop or use the arrow buttons to rank these motivators in order of importance to you in your
        professional life. Number 1 is most important, number 10 is least important.
      </p>

      {flowType === "team" && teamCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Team Code: {teamCode}</h3>
              <p className="text-sm text-green-700">Share this code with your team members</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(teamCode)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Copy Code
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Tips for ranking:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click and drag any item to reorder, or use the arrow buttons</li>
          <li>• Think about what truly energizes you at work, not just what you are good at</li>
          <li>• Consider your ideal work environment, not necessarily your current one</li>
        </ul>
      </div>

      <div className="space-y-3 mb-8">
        {surveyData.rankings.map((motivator, index) => (
          <div
            key={motivator}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", index.toString())
              e.dataTransfer.effectAllowed = "move"
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
            }}
            onDrop={(e) => {
              e.preventDefault()
              const draggedIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))
              const dropIndex = index

              if (draggedIndex !== dropIndex) {
                const newRankings = [...surveyData.rankings]
                const draggedItem = newRankings[draggedIndex]
                newRankings.splice(draggedIndex, 1)
                newRankings.splice(dropIndex, 0, draggedItem)
                setSurveyData((prev) => ({ ...prev, rankings: newRankings }))
              }
            }}
            className="flex items-start gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-blue-300"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <GripVertical className="text-gray-400 flex-shrink-0" size={16} />
              <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm min-w-[2.5rem] text-center flex-shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{motivator}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                    {intrinsicMotivators.includes(motivator) ? "Intrinsic" : "Extrinsic"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{motivatorDefinitions[motivator]}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              {index > 0 && (
                <button
                  onClick={() => moveItem(index, "up")}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Move up"
                >
                  <ArrowUp size={16} />
                </button>
              )}
              {index < surveyData.rankings.length - 1 && (
                <button
                  onClick={() => moveItem(index, "down")}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Move down"
                >
                  <ArrowDown size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => (flowType === "team" ? setCurrentStep("team-setup") : setCurrentStep("welcome"))}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          onClick={() => setCurrentStep("qualitative")}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )

  const QualitativeStep = () => {
    const [responses, setResponses] = useState(surveyData.qualitative)

    const handleInputChange = (questionId, value) => {
      const newResponses = { ...responses, [questionId]: value }
      setResponses(newResponses)
      setSurveyData((prev) => ({ ...prev, qualitative: newResponses }))
    }

    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reflection Questions</h2>
        <p className="text-gray-600 mb-8">
          Help us understand your motivations better by answering these reflection questions.
        </p>

        <div className="space-y-6">
          {qualitativeQuestions.map((q, index) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {index + 1}. {q.question}
              </label>
              <textarea
                defaultValue={responses[q.id] || ""}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts..."
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep("ranking")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <button
            onClick={() => setCurrentStep("demographics")}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Continue
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    )
  }

  const DemographicsStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Background Information</h2>
      <p className="text-gray-600 mb-8">
        This information helps us provide better insights and is kept completely anonymous.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Generational Group</label>
          <select
            value={surveyData.demographics.generation || ""}
            onChange={(e) => updateDemographics("generation", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your generation</option>
            {generationalGroups.map((gen) => (
              <option key={gen} value={gen}>
                {gen}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role/Title</label>
          <input
            type="text"
            value={surveyData.demographics.role || ""}
            onChange={(e) => updateDemographics("role", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Software Engineer, Marketing Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Function/Department</label>
          <input
            type="text"
            value={surveyData.demographics.function || ""}
            onChange={(e) => updateDemographics("function", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Engineering, Marketing, Sales"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
          <input
            type="text"
            value={surveyData.demographics.industry || ""}
            onChange={(e) => updateDemographics("industry", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={surveyData.demographics.country || ""}
            onChange={(e) => updateDemographics("country", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., United States, Canada, United Kingdom"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep("qualitative")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          onClick={() => setCurrentStep("reports")}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Complete Survey
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )

  const ReportsStep = () => {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Results</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setCurrentStep("individual-report")}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left hover:bg-blue-100 transition-colors"
          >
            <BarChart3 className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Individual Report</h3>
            <p className="text-blue-700 text-sm">Your personal motivation profile and insights for self-reflection</p>
          </button>

          {flowType === "team" && (
            <button
              onClick={() => setCurrentStep("team-report")}
              className="bg-green-50 border border-green-200 rounded-lg p-6 text-left hover:bg-green-100 transition-colors"
            >
              <Users className="text-green-600 mb-3" size={32} />
              <h3 className="text-lg font-semibold text-green-900 mb-2">Team Report</h3>
              <p className="text-green-700 text-sm">Aggregated team patterns and potential hygiene factor risks</p>
            </button>
          )}
        </div>

        {flowType === "team" && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Crown className="text-purple-600 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Premium Leader/HR/OD Guide</h3>
                <p className="text-purple-700 text-sm mb-4">
                  Get strategic recommendations and actionable advice for leaders to enhance team motivation and
                  performance.
                </p>
                <button
                  onClick={() => setCurrentStep("premium-report")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                >
                  View Sample Report
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Survey Complete!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for completing the Core Drive Framework survey. Click on the report buttons above to explore your
            results.
          </p>
          {flowType === "team" && (
            <p className="text-sm text-gray-500 mb-4">
              <strong>Team Code: {teamCode}</strong> - Share this with your team members so they can join the
              assessment.
            </p>
          )}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setCurrentStep("welcome")
                setFlowType(null)
                setTeamCode("")
                setEmail("")
                setSurveyData({ rankings: [], qualitative: {}, demographics: {} })
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Start New Survey
            </button>
          </div>
        </div>
      </div>
    )
  }

  const IndividualReportView = () => {
    const report = generateIndividualReport()

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setCurrentStep("reports")} className="text-gray-600 hover:text-gray-800">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Individual Report</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your Top Motivators</h3>
            <div className="space-y-3">
              {report.topMotivators.map((motivator, index) => (
                <div key={motivator} className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm min-w-[2rem] text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium block">{motivator}</span>
                    <span className="text-xs text-gray-500">
                      {intrinsicMotivators.includes(motivator) ? "Intrinsic" : "Extrinsic"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Motivation Profile</h3>
            <div className="text-center">
              <div
                className={`text-2xl font-bold mb-2 ${
                  report.motivationProfile === "Intrinsically Motivated"
                    ? "text-green-600"
                    : report.motivationProfile === "Extrinsically Motivated"
                      ? "text-blue-600"
                      : "text-purple-600"
                }`}
              >
                {report.motivationProfile}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Top 3: {report.intrinsicCount} Intrinsic, {report.extrinsicCount} Extrinsic
              </div>
              <div className="bg-gray-50 rounded p-4 text-sm text-left">
                {report.motivationProfile === "Intrinsically Motivated" &&
                  "You are primarily driven by internal factors like purpose, growth, and autonomy. You thrive when work feels meaningful and you have control over how you approach it."}
                {report.motivationProfile === "Extrinsically Motivated" &&
                  "You are motivated by external factors like recognition, belonging, and structured environments. You perform well with clear feedback and team connection."}
                {report.motivationProfile === "Balanced" &&
                  "You are motivated by both internal and external factors. This balance gives you flexibility to thrive in various work environments."}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">Personalized Insights</h3>
          <div className="space-y-4">
            {report.insights.map((insight, index) => (
              <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">Your Reflections</h3>
          <div className="space-y-6">
            {qualitativeQuestions.map((q) => (
              <div key={q.id}>
                <h4 className="font-medium text-gray-700 mb-2">{q.question}</h4>
                <div className="text-gray-600 bg-gray-50 p-3 rounded min-h-[60px]">
                  {surveyData.qualitative[q.id] || <span className="italic text-gray-400">No response provided</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const PremiumReportView = () => {
    const mockPremiumData = {
      teamName: "Engineering Team Alpha",
      riskAnalysis: {
        high: ["Psychological Safety", "Recognition"],
        medium: ["Dependability"],
        low: [],
      },
      leadershipRecommendations: [
        {
          category: "Communication Strategy",
          action: "Weekly 1:1s with focus on acknowledgment",
          timeline: "Implement within 2 weeks",
          impact: "High",
        },
        {
          category: "Team Culture",
          action: 'Establish "failure celebration" meetings',
          timeline: "Monthly starting next month",
          impact: "Medium",
        },
        {
          category: "Process Improvement",
          action: "Create predictable sprint planning process",
          timeline: "Next quarter",
          impact: "Medium",
        },
      ],
      generationalInsights: {
        "Gen Z": "Values rapid feedback and career growth visibility",
        Millennial: "Seeks work-life integration and purpose alignment",
        "Gen X": "Prefers autonomy and efficient processes",
      },
    }

    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setCurrentStep("reports")} className="text-gray-600 hover:text-gray-800">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Leader/HR/OD Guide</h2>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Premium</span>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Sample Premium Report</h3>
          <p className="text-purple-700 text-sm">
            This is a preview of the insights and recommendations available in the full premium report.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Risk Analysis
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Critical</span>
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-700 mb-2">High Risk Factors</h4>
                <div className="space-y-2">
                  {mockPremiumData.riskAnalysis.high.map((factor) => (
                    <div key={factor} className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="font-medium text-red-800">{factor}</div>
                      <div className="text-sm text-red-700 mt-1">
                        {factor === "Psychological Safety"
                          ? "67% of team ranked this low - risk of reduced innovation and speaking up"
                          : "58% of team ranked this low - risk of disengagement and turnover"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Medium Risk Factors</h4>
                <div className="space-y-2">
                  {mockPremiumData.riskAnalysis.medium.map((factor) => (
                    <div key={factor} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <div className="font-medium text-yellow-800">{factor}</div>
                      <div className="text-sm text-yellow-700 mt-1">
                        42% of team ranked this low - monitor for process inconsistencies
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Generational Insights</h3>
            <div className="space-y-4">
              {Object.entries(mockPremiumData.generationalInsights).map(([generation, insight]) => (
                <div key={generation} className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-medium text-blue-900">{generation}</h4>
                  <p className="text-sm text-blue-800 mt-1">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Strategic Action Plan</h3>
          <div className="space-y-6">
            {mockPremiumData.leadershipRecommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{rec.category}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.impact === "High" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {rec.impact} Impact
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{rec.action}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📅 Timeline: {rec.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Upgrade to Premium</h3>
          <p className="mb-4 text-purple-100">
            Get the complete strategic guide with detailed action plans, risk mitigation strategies, and ongoing team
            development recommendations.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-medium">
              Contact Sales
            </button>
            <button className="bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800 font-medium">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    )
  }

  const TeamReportView = () => {
    const teamData = {
      totalResponses: 12,
      topTeamMotivators: ["Collaboration", "Growth", "Purpose"],
      hygieneFactorRisks: ["Dependability", "Psychological Safety"],
      generationalBreakdown: {
        "Gen Z": 3,
        Millennial: 5,
        "Gen X": 3,
        "Baby Boomer": 1,
      },
      teamCode: teamCode,
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setCurrentStep("reports")} className="text-gray-600 hover:text-gray-800">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Team Report</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Team Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamData.totalResponses}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{teamData.topTeamMotivators.length}</div>
              <div className="text-sm text-gray-600">Top Motivators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{teamData.hygieneFactorRisks.length}</div>
              <div className="text-sm text-gray-600">Hygiene Risks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(teamData.generationalBreakdown).length}
              </div>
              <div className="text-sm text-gray-600">Generations</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Top Team Motivators</h3>
            <div className="space-y-3">
              {teamData.topTeamMotivators.map((motivator, index) => (
                <div key={motivator} className="flex items-center gap-3">
                  <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full text-sm min-w-[2rem] text-center">
                    {index + 1}
                  </span>
                  <span className="font-medium">{motivator}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Potential Hygiene Factor Risks</h3>
            <div className="space-y-3 mb-4">
              {teamData.hygieneFactorRisks.map((risk) => (
                <div key={risk} className="flex items-center gap-3">
                  <span className="bg-yellow-100 text-yellow-800 font-semibold px-3 py-1 rounded-full text-sm">!</span>
                  <span className="font-medium">{risk}</span>
                </div>
              ))}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
              <strong>Note:</strong> These factors may be taken for granted by the team. While not actively motivating,
              their absence could cause significant dissatisfaction.
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">Generational Breakdown</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(teamData.generationalBreakdown).map(([generation, count]) => (
              <div key={generation} className="text-center p-4 bg-gray-50 rounded">
                <div className="text-xl font-bold text-gray-700">{count}</div>
                <div className="text-sm text-gray-600">{generation}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
          <h4 className="font-semibold text-green-900 mb-2">Team Code: {teamData.teamCode}</h4>
          <p className="text-sm text-green-700">
            Continue sharing this code with team members to build a more complete team picture.
          </p>
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen />
      case "team-setup":
        return <TeamSetupScreen />
      case "ranking":
        return <RankingStep />
      case "qualitative":
        return <QualitativeStep />
      case "demographics":
        return <DemographicsStep />
      case "reports":
        return <ReportsStep />
      case "individual-report":
        return <IndividualReportView />
      case "team-report":
        return <TeamReportView />
      case "premium-report":
        return <PremiumReportView />
      default:
        return <WelcomeScreen />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto">{renderCurrentStep()}</div>
    </div>
  )
}

export default CoreDriveApp
