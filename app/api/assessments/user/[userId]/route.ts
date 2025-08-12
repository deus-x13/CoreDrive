import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const supabase = createClient()

    const { data: assessments, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", params.userId)
      .eq("status", "completed")
      .order("updated_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(assessments)
  } catch (error: any) {
    console.error("Error fetching user assessments:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}
