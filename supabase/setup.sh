#!/bin/bash

# Supabase Setup Script
# Usage: ./supabase/setup.sh YOUR_ACCESS_TOKEN YOUR_PROJECT_ID

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./supabase/setup.sh <ACCESS_TOKEN> <PROJECT_ID>"
    echo ""
    echo "To get your access token:"
    echo "1. Go to https://app.supabase.com/account/tokens"
    echo "2. Generate a new token"
    echo ""
    echo "To get your project ID:"
    echo "1. Go to your project dashboard"
    echo "2. Settings > General"
    echo "3. Copy the Reference ID"
    exit 1
fi

ACCESS_TOKEN=$1
PROJECT_ID=$2

echo "🔐 Logging in to Supabase..."
supabase login --token "$ACCESS_TOKEN"

echo "🔗 Linking to project..."
supabase link --project-ref "$PROJECT_ID"

echo "📦 Running migrations..."
supabase db push

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get your project URL and anon key from:"
echo "   https://app.supabase.com/project/$PROJECT_ID/settings/api"
echo ""
echo "2. Create .env.local file with:"
echo "   NEXT_PUBLIC_SUPABASE_URL=your_project_url"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"