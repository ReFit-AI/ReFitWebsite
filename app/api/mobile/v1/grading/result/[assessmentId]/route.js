import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock storage for assessments (in production, use database)
const mockAssessments = new Map();

export async function GET(request, { params }) {
  try {
    const { assessmentId } = params;

    // Check database first
    if (supabase) {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (!error && data) {
        return NextResponse.json({
          assessmentId,
          status: data.status,
          result: data.grading_result,
        });
      }
    }

    // Fallback to mock data for development
    // Simulate completed assessment after some time
    const mockResult = {
      assessmentId,
      status: 'completed',
      result: {
        grade: 'B',
        score: 82,
        damages: [
          {
            type: 'minor_scratches',
            severity: 2,
            location: { x: 120, y: 340 },
            confidence: 0.92,
          },
        ],
        estimatedValue: 700,
        confidence: 0.89,
        details: {
          screenIntact: true,
          powersOn: true,
          majorDamage: false,
        },
      },
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Result fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}