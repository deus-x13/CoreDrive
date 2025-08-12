import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

// PUT - Update an existing assessment
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    const { data, error } = await supabase.from("assessments").update(body).eq("id", id).select().single()

    if (error) {
      console.error("Error updating assessment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in PUT /api/assessments/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get a specific assessment
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data, error } = await supabase.from("assessments").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching assessment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in GET /api/assessments/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
