import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

let credentials;
try {
  const credentialsString = process.env.GOOGLE_CLOUD_CREDENTIALS;
  if (!credentialsString) {
    throw new Error('GOOGLE_CLOUD_CREDENTIALS is not set');
  }
  
  credentials = typeof credentialsString === 'object' 
    ? credentialsString 
    : JSON.parse(credentialsString);
    
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
} catch (error) {
  console.error('Feil ved parsing av credentials:', error);
  throw error;
}

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || '');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Ingen fil ble sendt' },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const cloudFile = bucket.file(fileName);
    await cloudFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    return NextResponse.json({
      url: publicUrl,
      navn: file.name
    });
    
  } catch (error) {
    console.error('Feil ved opplasting:', error);
    return NextResponse.json(
      { error: 'Feil ved opplasting av fil' },
      { status: 500 }
    );
  }
}