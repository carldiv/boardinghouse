import { NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Configure the Google Cloud Vision client using environment variables
    const client = new ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
    });

    const [result] = await client.textDetection({
      image: { content: buffer },
    });

    const detections = result.textAnnotations;
    const text = detections && detections[0] ? detections[0].description : "";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Google Vision OCR Error:", error);
    return NextResponse.json({ error: error.message || "OCR processing failed" }, { status: 500 });
  }
}
