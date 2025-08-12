"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

export default function CoreDriveApp() {
  const [currentStep, setCurrentStep] = useState("welcome")
  const [flowType, setFlowType] = useState(null)
  const [teamCode, setTeamCode] = useState("")
  const [email, setEmail] = useState("")

  const [assessmentId, setAssessmentId] = useState(null)
  const [saveStatus, setSaveStatus] = useState("saved") // "saving", "saved", "error"
  const [lastSaved, setLastSaved] = useState(null)

  // Rankings
  const [rankings, setRankings] = useState([])

  // Text inputs
  const [answer1, setAnswer1] = useState("")
  const [answer2, setAnswer2] = useState("")
  const [answer3, setAnswer3] = useState("")
  const [answer4, setAnswer4] = useState("")
  const [answer5, setAnswer5] = useState("")

  // Demographics
  const [generation, setGeneration] = useState("")
  const [role, setRole] = useState("")
  const [department, setDepartment] = useState("")
  const [industry, setIndustry] = useState("")
  const [country, setCountry] = useState("")

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "reset">("signin")
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [userAssessments, setUserAssessments] = useState<any[]>([])

  // Added authentication state variables
  // const [showAuthModal, setShowAuthModal] = useState(false)
  // const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  // const [user, setUser] = useState<any>(null)
  // const [authLoading, setAuthLoading] = useState(false)
  // const [authEmail, setAuthEmail] = useState("")
  // const [authPassword, setAuthPassword] = useState("")

  const [setDemographics] = useState({})
  const [setQualitativeAnswers] = useState({})
  const [setTeamMembers] = useState([])

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const resetAllFormData = () => {
    // Reset all form states
    setAnswer1("")
    setAnswer2("")
    setAnswer3("")
    setAnswer4("")
    setAnswer5("")
    setGeneration("")
    setRole("")
    setDepartment("")
    setIndustry("")
    setCountry("")
    setTeamCode("")
    // setTeamSize("")
    setAssessmentId(null)
    setSaveStatus("saved")
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)

    try {
      const supabase = createClient()

      if (authMode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: `${window.location.origin}/auth/callback`,
        })

        if (error) throw error

        alert("Check your email for the password reset link!")
        setShowAuthModal(false)
      } else if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        alert("Check your email for the confirmation link!")
        setShowAuthModal(false)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })

        if (error) throw error

        setUser(data.user)
        setShowAuthModal(false)
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setAuthLoading(false)
      setAuthEmail("")
      setAuthPassword("")
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  const loadUserAssessments = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/assessments/user/${user.id}`)
      if (response.ok) {
        const assessments = await response.json()
        setUserAssessments(assessments)
      }
    } catch (error) {
      console.error("Error loading user assessments:", error)
    }
  }

  useEffect(() => {
    if (user && currentStep === "profile") {
      loadUserAssessments()
    }
  }, [user, currentStep])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const saveAssessment = async () => {
    if (!assessmentId && (currentStep === "welcome" || !flowType)) return

    setSaveStatus("saving")

    try {
      const assessmentData = {
        flow_type: flowType,
        status:
          currentStep === "reports-selection" ||
          currentStep === "individual-report" ||
          currentStep === "team-report" ||
          currentStep === "leader-guide" ||
          currentStep === "reports"
            ? "completed"
            : "in_progress",
        age_range: generation,
        gender: null, // Not collected in current form
        years_experience: role,
        industry: industry,
        role_level: department,
        qualitative_responses: [answer1, answer2, answer3, answer4, answer5].filter((a) => a.trim()),
        ranking_data: rankings.map((motivator, index) => ({
          motivator: motivator.text,
          rank: index + 1,
        })),
        team_name: teamCode,
        team_size: null, // Could be added later
        team_members: null, // Could be added later
      }

      let response
      if (assessmentId) {
        // Update existing assessment
        response = await fetch(`/api/assessments/${assessmentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assessmentData),
        })
      } else {
        // Create new assessment
        response = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assessmentData),
        })
      }

      if (!response.ok) throw new Error("Failed to save")

      const result = await response.json()
      if (!assessmentId) {
        setAssessmentId(result.data.id)
      }

      setSaveStatus("saved")
      setLastSaved(new Date())
    } catch (error) {
      console.error("Save error:", error)
      setSaveStatus("error")
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep !== "welcome") {
        saveAssessment()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [
    currentStep,
    flowType,
    rankings,
    answer1,
    answer2,
    answer3,
    answer4,
    answer5,
    generation,
    role,
    department,
    industry,
    country,
    teamCode,
  ])

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentStep])

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

  const generationalGroups = ["Gen Z", "Millennial", "Gen X", "Baby Boomer"]

  const moveItem = (fromIndex, direction) => {
    const newRankings = [...rankings]
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1

    if (toIndex >= 0 && toIndex < newRankings.length) {
      const item = newRankings[fromIndex]
      newRankings.splice(fromIndex, 1)
      newRankings.splice(toIndex, 0, item)
      setRankings(newRankings)
    }
  }

  const initializeRankings = () => {
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
    const shuffledMotivators = shuffleArray(motivators)
    setRankings(shuffledMotivators.map((motivator, index) => ({ id: index + 1, text: motivator })))
  }

  const generateRandomTeamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const generateIndividualReport = () => {
    const top3 = rankings.slice(0, 3)
    const intrinsicCount = top3.filter((m) => intrinsicMotivators.includes(m.text)).length
    const extrinsicCount = top3.filter((m) => !intrinsicMotivators.includes(m.text)).length

    const insights = []
    if (top3.some((m) => m.text === "Purpose & Meaning")) {
      insights.push(
        "You are driven by meaning and impact. Seek opportunities to connect your daily work to larger organizational goals.",
      )
    }
    if (top3.some((m) => m.text === "Autonomy & Independence")) {
      insights.push(
        "Independence is crucial for you. Consider discussing flexible work arrangements or decision-making authority with your manager.",
      )
    }
    if (top3.some((m) => m.text === "Learning & Development")) {
      insights.push(
        "Learning and development energize you. Actively pursue new challenges, skills, and career advancement opportunities.",
      )
    }

    return {
      topMotivators: top3.map((m) => m.text),
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

  const startSurvey = (type: "individual" | "team") => {
    if (!user) {
      alert("Please sign in to take the activity")
      setShowAuthModal(true)
      return
    }

    resetAllFormData() // Clear all previous data
    setFlowType(type)
    initializeRankings()
    setCurrentStep("ranking")
  }

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))

    if (dragIndex !== dropIndex) {
      const newRankings = [...rankings]
      const draggedItem = newRankings[dragIndex]
      newRankings.splice(dragIndex, 1)
      newRankings.splice(dropIndex, 0, draggedItem)
      setRankings(newRankings)
    }
  }

  const resetForm = () => {
    setCurrentStep("welcome")
    setFlowType(null)
    setTeamCode("")
    setEmail("")
    setRankings([])
    setAnswer1("")
    setAnswer2("")
    setAnswer3("")
    setAnswer4("")
    setAnswer5("")
    setGeneration("")
    setRole("")
    setDepartment("")
    setIndustry("")
    setCountry("")
    setAssessmentId(null)
    setSaveStatus("saved")
    setLastSaved(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentStep("welcome")} className="flex items-center gap-3 hover:opacity-80">
              <img src="/bespoke-mind-logo.png" alt="Bespoke Mind" className="h-8 w-8" />
              {/* Changed "Core Drive Survey" to "Core Drive Activity" */}
              <h1 className="text-xl font-bold text-gray-900">Core Drive Activity</h1>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button onClick={() => setCurrentStep("profile")} className="text-sm text-blue-600 hover:text-blue-800">
                  Profile
                </button>
                <button onClick={handleSignOut} className="text-sm text-blue-600 hover:text-blue-800">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode("signin")
                    setShowAuthModal(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signup")
                    setShowAuthModal(true)
                  }}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {saveStatus && saveStatus !== "saved" && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="text-sm text-blue-700">
              {saveStatus === "saving" && "💾 Saving your progress..."}
              {saveStatus === "error" && "⚠️ Error saving - your progress may not be saved"}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Screen */}
      <div className={currentStep === "welcome" ? "block" : "hidden"}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            {/* Updated main heading and description to use "activity" terminology */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Core Drive Activity</h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover what motivates you and your team using the Core Drive framework
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Updated individual survey button to use startSurvey function */}
            <button
              onClick={() => startSurvey("individual")}
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Individual</h3>
              <p className="text-blue-100">Take the activity for yourself</p>
            </button>

            <button
              onClick={() => startSurvey("team")}
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Team</h3>
              <p className="text-green-100">Assess your team's motivation drivers</p>
            </button>
          </div>
        </div>
      </div>

      <div className={currentStep === "profile" ? "block" : "hidden"}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
            <button onClick={() => setCurrentStep("welcome")} className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">Account Information</h3>
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">
              Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Renamed "Assessment" to "Survey" throughout the interface */}
            {/* Updated history section to use "activity" terminology */}
            <h3 className="text-lg font-semibold mb-4">Your Activity History</h3>
            {userAssessments.length === 0 ? (
              <p className="text-gray-600">No activities completed yet.</p>
            ) : (
              <div className="space-y-4">
                {userAssessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium capitalize">{assessment.flow_type} Activity</h4>
                        <p className="text-sm text-gray-600">
                          Completed: {new Date(assessment.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // Load this assessment data
                          setFlowType(assessment.flow_type)
                          setDemographics(assessment.demographics || {})
                          setQualitativeAnswers(assessment.qualitative_responses || {})
                          setRankings(assessment.rankings || [])
                          setTeamMembers(assessment.team_members || [])
                          setCurrentStep("reports-selection")
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Reports
                      </button>
                    </div>
                    {assessment.demographics?.name && (
                      <p className="text-sm text-gray-600">Name: {assessment.demographics.name}</p>
                    )}
                    {assessment.team_members?.length > 0 && (
                      <p className="text-sm text-gray-600">Team Size: {assessment.team_members.length} members</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Added authentication modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {authMode === "signin" ? "Sign In" : authMode === "signup" ? "Create Account" : "Reset Password"}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {authMode !== "reset" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {authLoading
                  ? "Loading..."
                  : authMode === "signin"
                    ? "Sign In"
                    : authMode === "signup"
                      ? "Create Account"
                      : "Send Reset Email"}
              </button>
            </form>

            <div className="mt-4 text-center space-y-2">
              {authMode === "signin" && (
                <>
                  <button
                    onClick={() => setAuthMode("reset")}
                    className="text-sm text-blue-600 hover:text-blue-700 block w-full"
                  >
                    Forgot your password?
                  </button>
                  <button onClick={() => setAuthMode("signup")} className="text-sm text-blue-600 hover:text-blue-700">
                    Don't have an account? Sign up
                  </button>
                </>
              )}
              {authMode === "signup" && (
                <button onClick={() => setAuthMode("signin")} className="text-sm text-blue-600 hover:text-blue-700">
                  Already have an account? Sign in
                </button>
              )}
              {authMode === "reset" && (
                <button onClick={() => setAuthMode("signin")} className="text-sm text-blue-600 hover:text-blue-700">
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome Screen */}
        {/* <div className={currentStep === "welcome" ? "block" : "hidden"}>
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">Core Drive Assessment</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover what truly motivates you at work and unlock insights to enhance your performance and
                satisfaction.
              </p>
            </div>

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
                    setCurrentStep("ranking")
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

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentStep("welcome")
                  setFlowType(null)
                  setTeamCode("")
                  setEmail("")
                  setRankings([])
                  setAnswer1("")
                  setAnswer2("")
                  setAnswer3("")
                  setAnswer4("")
                  setAnswer5("")
                  setGeneration("")
                  setRole("")
                  setDepartment("")
                  setIndustry("")
                  setCountry("")
                  setAssessmentId(null)
                  setSaveStatus("saved")
                  setLastSaved(null)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Start New Survey
              </button>
            </div>
          </div>
        </div> */}

        {/* Team Setup Screen */}
        <div className={currentStep === "team-setup" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Assessment Setup</h2>
              <p className="text-gray-600">Join an existing team or create a new team assessment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Join Existing Team</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Code</label>
                    <input
                      type="text"
                      value={teamCode}
                      onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                      placeholder="Enter team code"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {/* Updated team survey buttons to reset form data */}
                  <button
                    onClick={() => {
                      if (teamCode.trim()) {
                        resetAllFormData()
                        setFlowType("team")
                        initializeRankings()
                        setCurrentStep("ranking")
                      }
                    }}
                    disabled={!teamCode.trim()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Join Team
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="team-leader@company.com"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {/* Updated team survey buttons to reset form data */}
                  <button
                    onClick={() => {
                      if (email.trim()) {
                        const newTeamCode = generateRandomTeamCode()
                        setTeamCode(newTeamCode)
                        resetAllFormData()
                        setFlowType("team")
                        initializeRankings()
                        setCurrentStep("ranking")
                      }
                    }}
                    disabled={!email.trim()}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Create Team
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setCurrentStep("welcome")} className="text-blue-600 hover:text-blue-800">
                ← Back to Welcome
              </button>
            </div>
          </div>
        </div>

        {/* Ranking Screen */}
        <div className={currentStep === "ranking" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rank Your Work Motivators</h2>
              <p className="text-gray-600">
                Drag and drop or use the arrows to rank these motivators from most important (top) to least important
                (bottom) for you personally.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Ranking Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Think about what energizes you most at work</li>
                <li>• Consider what you miss most when it's absent</li>
                <li>• Focus on your personal preferences, not what others expect</li>
                <li>• There are no right or wrong answers</li>
              </ul>
            </div>

            <div className="space-y-3">
              {rankings.map((motivator, index) => (
                <div
                  key={motivator.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-move"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{motivator.text}</h3>
                      <p className="text-sm text-gray-600">{motivatorDefinitions[motivator.text]}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === rankings.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(flowType === "team" ? "team-setup" : "welcome")}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep("qualitative")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Qualitative Questions Screen */}
        <div className={currentStep === "qualitative" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reflection Questions</h2>
              <p className="text-gray-600">
                Please share your thoughts on these questions to help us provide more personalized insights.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Describe a time when you felt most motivated and engaged at work. What made that experience
                  special?
                </label>
                <textarea
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your experience..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">{answer1.length}/500</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. What aspects of your current work environment drain your energy or motivation?
                </label>
                <textarea
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Be honest about challenges..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">{answer2.length}/500</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. If you could change one thing about your work to increase your motivation, what would it be?
                </label>
                <textarea
                  value={answer3}
                  onChange={(e) => setAnswer3(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Think about your ideal scenario..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">{answer3.length}/500</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4. How do you prefer to receive recognition for your work?
                </label>
                <textarea
                  value={answer4}
                  onChange={(e) => setAnswer4(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Public praise, private feedback, rewards..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">{answer4.length}/500</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  5. What role does work-life balance play in your overall job satisfaction?
                </label>
                <textarea
                  value={answer5}
                  onChange={(e) => setAnswer5(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your perspective..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">{answer5.length}/500</div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep("ranking")} className="text-blue-600 hover:text-blue-800">
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep("demographics")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Demographics Screen */}
        <div className={currentStep === "demographics" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Background Information</h2>
              <p className="text-gray-600">
                This information helps us provide more relevant insights and benchmarking data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Generation</label>
                <select
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select generation</option>
                  {generationalGroups.map((gen) => (
                    <option key={gen} value={gen}>
                      {gen}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Level</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select role level</option>
                  <option value="Individual Contributor">Individual Contributor</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Manager">Manager</option>
                  <option value="Senior Manager">Senior Manager</option>
                  <option value="Director">Director</option>
                  <option value="VP">VP</option>
                  <option value="C-Level">C-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Success">Customer Success</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Legal">Legal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Media">Media</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep("qualitative")} className="text-blue-600 hover:text-blue-800">
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep("reports-selection")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Complete Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Reports Selection Screen */}
        <div className={currentStep === "reports-selection" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              {/* Updated reports heading to use "activity" */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Reports</h2>
              <p className="text-gray-600 mb-6">Choose which report you'd like to view:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Individual Report</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Your personal motivation profile with insights and recommendations.
                </p>
                <button
                  onClick={() => setCurrentStep("individual-report")}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Individual Report
                </button>
              </div>

              {flowType === "team" && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Team Report</h3>
                    <p className="text-green-800 text-sm mb-4">Aggregated team insights and motivation patterns.</p>
                    <button
                      onClick={() => setCurrentStep("team-report")}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      View Team Report
                    </button>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Leader Guide</h3>
                    <p className="text-purple-800 text-sm mb-4">
                      Strategic insights and action plans for team leaders.
                    </p>
                    <button
                      onClick={() => setCurrentStep("leader-guide")}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      View Leader Guide
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="text-center pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  resetForm()
                  setCurrentStep("welcome")
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                {/* Renamed "Start New Survey" to "Home" */}
                Home
              </button>
            </div>
          </div>
        </div>

        {/* Individual Report Screen */}
        <div className={currentStep === "individual-report" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Individual Report</h2>
            </div>

            {(() => {
              const report = generateIndividualReport()
              return (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Top 3 Motivators</h3>
                    <div className="space-y-3">
                      {report.topMotivators.map((motivator, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{motivator}</h4>
                            <p className="text-sm text-gray-600">{motivatorDefinitions[motivator]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Motivation Profile</h3>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{report.motivationProfile}</div>
                      <p className="text-gray-600 mb-4">
                        {report.motivationProfile === "Intrinsically Motivated"
                          ? "You are primarily driven by internal satisfaction and personal growth."
                          : report.motivationProfile === "Extrinsically Motivated"
                            ? "You are primarily motivated by external rewards and recognition."
                            : "You have a balanced mix of intrinsic and extrinsic motivators."}
                      </p>
                      <div className="flex justify-center space-x-8">
                        <div className="text-center">
                          <div className="text-xl font-semibold text-green-600">{report.intrinsicCount}</div>
                          <div className="text-sm text-gray-600">Intrinsic</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-semibold text-orange-600">{report.extrinsicCount}</div>
                          <div className="text-sm text-gray-600">Extrinsic</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Insights</h3>
                    <div className="space-y-3">
                      {report.insights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="bg-yellow-100 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">
                            💡
                          </div>
                          <p className="text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep("reports-selection")} className="text-blue-600 hover:text-blue-800">
                ← Back to Reports
              </button>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Team Report Screen */}
        <div className={currentStep === "team-report" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Report</h2>
              <p className="text-gray-600">Team Code: {teamCode}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1</div>
                    <div className="text-sm text-gray-600">Team Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">Mixed</div>
                    <div className="text-sm text-gray-600">Motivation Profile</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">High</div>
                    <div className="text-sm text-gray-600">Engagement Potential</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Team Motivators</h3>
                <div className="space-y-3">
                  {rankings.slice(0, 5).map((motivator, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{motivator.text}</span>
                      </div>
                      <div className="text-sm text-gray-600">100% alignment</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Potential Hygiene Risks</h3>
                <div className="space-y-3">
                  {rankings.slice(-3).map((motivator, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">
                        ⚠️
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{motivator.text}</div>
                        <div className="text-sm text-gray-600">
                          Low priority for team - monitor for potential dissatisfaction
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep("reports-selection")} className="text-blue-600 hover:text-blue-800">
                ← Back to Reports
              </button>
              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Print Team Report
              </button>
            </div>
          </div>
        </div>

        {/* Leader Guide Screen */}
        <div className={currentStep === "leader-guide" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Leader Guide</h2>
              <p className="text-gray-600">Strategic insights and action plans for team leaders</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Key Risk Areas</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-400 pl-4">
                    <h4 className="font-medium text-gray-900">Motivation Misalignment</h4>
                    <p className="text-sm text-gray-600">
                      Team members may have different motivation drivers. Regular check-ins recommended.
                    </p>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <h4 className="font-medium text-gray-900">Hygiene Factor Neglect</h4>
                    <p className="text-sm text-gray-600">
                      Low-ranked motivators still need basic attention to prevent dissatisfaction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Generational Insights</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Your Team Profile</h4>
                    <p className="text-sm text-blue-800">
                      Based on demographics: {generation || "Mixed generation"} team with {role || "varied"} experience
                      levels.
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Recommendation:</strong> Tailor communication and recognition approaches to match
                    generational preferences.
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 30-60-90 Day Action Plan</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700">30 Days: Foundation</h4>
                    <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                      <li>• Schedule 1:1s with each team member to discuss their top motivators</li>
                      <li>• Review current recognition and reward systems</li>
                      <li>• Identify quick wins for top team motivators</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700">60 Days: Implementation</h4>
                    <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                      <li>• Implement personalized motivation strategies</li>
                      <li>• Address any hygiene factor gaps</li>
                      <li>• Establish regular feedback mechanisms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-700">90 Days: Optimization</h4>
                    <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                      <li>• Measure engagement and satisfaction improvements</li>
                      <li>• Refine approaches based on feedback</li>
                      <li>• Plan for long-term motivation sustainability</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Practical Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Weekly Check-in Template</h4>
                    <p className="text-sm text-gray-600">
                      "What energized you most this week? What drained your energy?"
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Recognition Framework</h4>
                    <p className="text-sm text-gray-600">Match recognition style to individual motivator preferences</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep("reports-selection")} className="text-blue-600 hover:text-blue-800">
                ← Back to Reports
              </button>
              <button
                onClick={() => window.print()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Print Leader Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
