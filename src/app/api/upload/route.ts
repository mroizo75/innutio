import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-utils';
import { uploadFile } from '@/lib/googleCloudStorage';

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    const { url, navn } = await uploadFile(file)
    
    return NextResponse.json({ url, navn })
  } catch (error) {
    console.error("Upload error:", error)
    return new NextResponse("Upload failed", { status: 500 })
  }
}