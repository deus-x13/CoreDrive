"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"

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
  // const [authMode, setAuthMode, setAuthPassword] = useState<"signin" | "signup">("signin")
  // const [user, setUser] = useState<any>(null)
  // const [authLoading, setAuthLoading] = useState(false)
  // const [authEmail, setAuthEmail] => useState("")
  // const [authPassword, setAuthPassword] => useState("")

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

  const handleAuth = async () => {
    try {
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

  const loadAssessmentData = async (assessmentIdToLoad) => {
    try {
      const response = await fetch(`/api/assessments/${assessmentIdToLoad}`)
      if (response.ok) {
        const assessment = await response.json()
        setFlowType(assessment.flow_type)
        setGeneration(assessment.age_range || "")
        setRole(assessment.years_experience || "")
        setDepartment(assessment.role_level || "")
        setIndustry(assessment.industry || "")
        setCountry("")
        setTeamCode(assessment.team_name || "")
        setRankings(assessment.ranking_data || [])
        setAnswer1(assessment.qualitative_responses?.[0] || "")
        setAnswer2(assessment.qualitative_responses?.[1] || "")
        setAnswer3(assessment.qualitative_responses?.[2] || "")
        setAnswer4(assessment.qualitative_responses?.[3] || "")
        setAnswer5(assessment.qualitative_responses?.[4] || "")
      }
    } catch (error) {
      console.error("Error loading assessment data:", error)
    }
  }

  useEffect(() => {
    if (
      (currentStep === "reports-selection" ||
        currentStep === "team-report" ||
        currentStep === "individual-report" ||
        currentStep === "leader-guide") &&
      assessmentId &&
      !teamCode
    ) {
      loadAssessmentData(assessmentId)
    }
  }, [currentStep, assessmentId])

  useEffect(() => {
    if (user && currentStep === "profile") {
      loadUserAssessments()
    }
  }, [user, currentStep])

  useEffect(() => {
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
      return
    }
    resetAllFormData() // Clear all previous data
    setFlowType(type)

    if (type === "team") {
      setCurrentStep("team-setup") // Go to team setup first for team assessments
    } else {
      initializeRankings()
      setCurrentStep("ranking") // Go directly to ranking for individual assessments
    }
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
              <h1 className="text-xl font-bold text-gray-900">Core Drive</h1>
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
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Core Drive Framework</h1>
          <p className="text-xl text-gray-600 mb-12">
            Discover what motivates you at work and help create environments that align with those drivers.
          </p>

          <div className="mb-12 max-w-2xl mx-auto text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-6">What You Will Do:</h3>
            <ul className="space-y-3 text-gray-700">
              <li>• Rank 10 core workplace motivators by importance to you</li>
              <li>• Answer reflection questions about your work experience</li>
              <li>• Provide basic demographic information</li>
              <li>• Receive personalized insights and recommendations</li>
            </ul>
            <p className="text-sm text-gray-500 mt-8 text-center">
              Survey takes approximately 8-10 minutes. All responses are confidential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div
              onClick={() => startSurvey("individual")}
              className="bg-blue-50 border border-blue-200 p-8 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            >
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Individual Assessment</h2>
              <p className="text-gray-600 mb-6">
                Get personal insights about your work motivators and receive an individual report.
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full">
                Start Individual Survey
              </button>
            </div>

            <div
              onClick={() => startSurvey("team")}
              className="bg-green-50 border border-green-200 p-8 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            >
              <div className="text-green-600 text-4xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-green-900 mb-4">Team Assessment</h2>
              <p className="text-gray-600 mb-6">
                Join your team assessment to see both individual and team-level insights.
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full">
                Join Team Survey
              </button>
            </div>
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
                          setGeneration(assessment.age_range || "")
                          setRole(assessment.years_experience || "")
                          setDepartment(assessment.role_level || "")
                          setIndustry(assessment.industry || "")
                          setCountry("")
                          setTeamCode(assessment.team_name || "")
                          setRankings(assessment.ranking_data || [])
                          setAnswer1(assessment.qualitative_responses?.[0] || "")
                          setAnswer2(assessment.qualitative_responses?.[1] || "")
                          setAnswer3(assessment.qualitative_responses?.[2] || "")
                          setAnswer4(assessment.qualitative_responses?.[3] || "")
                          setAnswer5(assessment.qualitative_responses?.[4] || "")
                          setCurrentStep("reports-selection")
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Reports
                      </button>
                    </div>
                    {assessment.age_range && (
                      <p className="text-sm text-gray-600">Generation: {assessment.age_range}</p>
                    )}
                    {assessment.team_name && <p className="text-sm text-gray-600">Team Name: {assessment.team_name}</p>}
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
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Assessment Setup</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Code</h3>
                <p className="text-gray-600 mb-4">
                  <strong>Team Leaders:</strong> Generate a new team code to share with your team members.
                  <br />
                  <strong>Team Members:</strong> Enter the team code provided by your team leader.
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="ENTER TEAM CODE"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono tracking-wider text-lg"
                  />

                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        const newTeamCode = generateRandomTeamCode()
                        setTeamCode(newTeamCode)
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Generate Team Code
                    </button>
                  </div>

                  {teamCode && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm text-center mb-2">
                        <strong>Share this code with your team:</strong>
                      </p>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="font-mono text-lg font-semibold text-green-900">{teamCode}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(teamCode)
                            // Simple feedback - could be enhanced with toast notification
                            const button = event.target as HTMLButtonElement
                            const originalText = button.innerHTML
                            button.innerHTML = "✓"
                            setTimeout(() => {
                              button.innerHTML = originalText
                            }, 1000)
                          }}
                          className="bg-green-600 text-white p-1 rounded hover:bg-green-700 transition-colors"
                          title="Copy team code"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Email Address</h3>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@company.com"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setCurrentStep("welcome")}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (email.trim() && teamCode.trim()) {
                    resetAllFormData()
                    setFlowType("team")
                    initializeRankings()
                    setCurrentStep("ranking")
                  }
                }}
                disabled={!email.trim() || !teamCode.trim()}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue →
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

            <div className="grid md:grid-cols-2 gap-6">
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
                  <option value="Government">Government</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
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
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setCurrentStep("qualitative")}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  setCurrentStep("reports-selection")
                }}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Reports Selection Screen */}
        <div className={currentStep === "reports-selection" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Reports</h2>
              <p className="text-gray-600">Choose which report you'd like to view based on your responses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Individual Report</h3>
                <p className="text-gray-600 mb-4">
                  Get personalized insights about your work motivators and recommendations for enhancing your work
                  experience.
                </p>
                <button
                  onClick={() => setCurrentStep("individual-report")}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Individual Report
                </button>
              </div>

              {flowType === "team" && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Report</h3>
                  <p className="text-gray-600 mb-4">
                    Understand your team's collective motivators and identify opportunities for team alignment.
                  </p>
                  <button
                    onClick={() => setCurrentStep("team-report")}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    View Team Report
                  </button>
                </div>
              )}

              {flowType === "team" && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Leader Guide</h3>
                  <p className="text-gray-600 mb-4">
                    Access strategic insights and action plans for leaders, HR professionals, and organizational
                    development.
                  </p>
                  <button
                    onClick={() => setCurrentStep("leader-guide")}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    View Leader Guide
                  </button>
                </div>
              )}
            </div>

            <div className="text-center pt-6">
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
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Home
              </button>
            </div>
          </div>
        </div>

        <div className={currentStep === "individual-report" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Individual Report</h2>
              <p className="text-gray-600">Based on your responses, here are your personalized insights.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Top Motivators</h3>
              <div className="space-y-3">
                {rankings.slice(0, 3).map((motivator, index) => (
                  <div key={motivator.id} className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{motivator.text}</h4>
                      <p className="text-sm text-gray-600">{motivatorDefinitions[motivator.text]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Insights</h3>
              <div className="space-y-4">
                {rankings.slice(0, 3).map((motivator, index) => (
                  <div key={motivator.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{motivator.text}</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      This is a key driver for you. Consider discussing with your manager how to incorporate more of
                      this into your daily work.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentStep("reports-selection")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Reports
              </button>
            </div>
          </div>
        </div>

        <div className={currentStep === "team-report" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Report</h2>
              <p className="text-gray-600">Collective insights for your team.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Overview</h3>
              <p className="text-gray-600">
                Team Code: <span className="font-mono font-semibold text-lg">{teamCode || "Not Available"}</span>
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Contribution</h3>
              <div className="space-y-3">
                {rankings.slice(0, 3).map((motivator, index) => (
                  <div key={motivator.id} className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{motivator.text}</h4>
                      <p className="text-sm text-gray-600">{motivatorDefinitions[motivator.text]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentStep("reports-selection")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Back to Reports
              </button>
            </div>
          </div>
        </div>

        <div className={currentStep === "leader-guide" ? "block" : "hidden"}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Leader Guide</h2>
              <p className="text-gray-600">Strategic insights and action plans for team leaders.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Leadership Insights</h3>
              <p className="text-gray-600 mb-4">Based on your team's responses, here are key areas to focus on:</p>

              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium text-gray-900">Focus Areas</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Review your team's top motivators and create action plans to enhance these areas.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium text-gray-900">Development Opportunities</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Identify gaps between individual and team motivators to create targeted development plans.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentStep("reports-selection")}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Back to Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
