import { NextResponse } from 'next/server';

export async function GET() {
  const criteria = {
    grades: {
      'A': {
        label: 'Like New',
        description: 'No visible damage, perfect working condition',
        requirements: [
          'No scratches or marks visible',
          'Screen in perfect condition',
          'All buttons and features working',
          'Battery health above 90%',
        ],
        priceMultiplier: 0.90,
      },
      'B': {
        label: 'Good',
        description: 'Minor cosmetic wear, fully functional',
        requirements: [
          'Light scratches only',
          'No cracks on screen',
          'All features working normally',
          'Battery health above 80%',
        ],
        priceMultiplier: 0.75,
      },
      'C': {
        label: 'Fair',
        description: 'Visible damage but fully functional',
        requirements: [
          'Visible scratches or minor cracks',
          'All core features working',
          'May have minor cosmetic issues',
          'Battery health above 70%',
        ],
        priceMultiplier: 0.55,
      },
      'D': {
        label: 'Poor',
        description: 'Major damage but still functional',
        requirements: [
          'Significant damage visible',
          'Core features still working',
          'May have functional limitations',
          'Battery health above 60%',
        ],
        priceMultiplier: 0.30,
      },
      'F': {
        label: 'Broken',
        description: 'For parts only',
        requirements: [
          'Device not fully functional',
          'Major damage or missing parts',
          'May not power on',
          'Suitable for parts/recycling only',
        ],
        priceMultiplier: 0.10,
      },
    },
    damageTypes: {
      screen_crack: {
        label: 'Screen Crack',
        severityImpact: {
          1: -5,  // Hairline crack
          2: -10, // Minor crack
          3: -20, // Moderate crack
          4: -35, // Major crack
          5: -50, // Shattered
        },
      },
      body_damage: {
        label: 'Body Damage',
        severityImpact: {
          1: -3,  // Minor scuff
          2: -7,  // Scratch
          3: -15, // Dent
          4: -25, // Major dent
          5: -40, // Structural damage
        },
      },
      camera_damage: {
        label: 'Camera Damage',
        severityImpact: {
          1: -5,  // Minor scratch
          2: -10, // Visible scratch
          3: -20, // Crack
          4: -30, // Major damage
          5: -40, // Non-functional
        },
      },
      minor_scratches: {
        label: 'Minor Scratches',
        severityImpact: {
          1: -2,
          2: -5,
          3: -8,
          4: -12,
          5: -15,
        },
      },
    },
    photoRequirements: [
      {
        id: 'front-off',
        required: true,
        purpose: 'Detect screen damage and front cosmetic condition',
      },
      {
        id: 'front-on',
        required: true,
        purpose: 'Check for dead pixels, burn-in, and functionality',
      },
      {
        id: 'back',
        required: true,
        purpose: 'Assess back panel condition and camera lens',
      },
      {
        id: 'corners',
        required: true,
        purpose: 'Check for drops, dents, and structural damage',
      },
    ],
  };

  return NextResponse.json(criteria);
}