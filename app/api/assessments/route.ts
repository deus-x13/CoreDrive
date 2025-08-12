import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

// POST - Create a new assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase.from("assessments").insert([body]).select().single()

    if (error) {
      console.error("Error creating assessment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in POST /api/assessments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Retrieve assessments (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const flowType = searchParams.get("flow_type")
    const status = searchParams.get("status")

    let query = supabase.from("assessments").select("*")

    if (id) {
      query = query.eq("id", id)
    }
    if (flowType) {
      query = query.eq("flow_type", flowType)
    }
    if (status) {
      query = query.eq("status", status)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching assessments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in GET /api/assessments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
