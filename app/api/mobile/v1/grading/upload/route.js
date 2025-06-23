import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { deviceModel, photos } = body;

    // Validate input
    if (!deviceModel || !photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'Device model and photos are required' },
        { status: 400 }
      );
    }

    // Create assessment record
    const assessmentId = uuidv4();
    const timestamp = new Date().toISOString();

    // In production, you would:
    // 1. Upload images to cloud storage (S3, Cloudinary, etc.)
    // 2. Store image URLs in database
    // 3. Queue for AI processing

    // For now, we'll simulate the process
    const imageUrls = photos.map((photo, index) => ({
      step: photo.step,
      url: `https://storage.example.com/assessments/${assessmentId}/${index}.jpg`,
      uploadedAt: timestamp,
    }));

    // Store assessment in database (if using Supabase)
    if (supabase) {
      const { error } = await supabase
        .from('assessments')
        .insert({
          id: assessmentId,
          device_model: deviceModel,
          images: imageUrls,
          status: 'uploaded',
          created_at: timestamp,
        });

      if (error) {
        console.error('Database error:', error);
      }
    }

    return NextResponse.json({
      assessmentId,
      status: 'uploaded',
      imageCount: photos.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}