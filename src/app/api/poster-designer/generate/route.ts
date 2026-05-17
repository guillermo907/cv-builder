import { NextResponse } from "next/server";

const defaultEndpoint = "http://127.0.0.1:8000/v1/posters/generate";

export async function POST(request: Request) {
  const payload = await request.json();
  const endpoint = process.env.POSTER_DESIGNER_API_URL || defaultEndpoint;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") && text ? JSON.parse(text) : { detail: text };

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          detail: body?.detail || "No fue posible generar propuestas con el diseñador IA.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ ok: true, ...body }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        detail:
          error instanceof Error
            ? `${error.message}. Asegura que el servicio FastAPI del diseñador esté corriendo en ${endpoint}.`
            : "No fue posible conectar con el diseñador IA.",
      },
      { status: 502 },
    );
  }
}
