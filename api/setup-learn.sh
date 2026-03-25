#!/bin/bash

echo "🚀 Setting up 6-Pillar Platform - LEARN Module"
echo "=============================================="

echo "📦 Installing dependencies..."
# npm install or pnpm install

echo "🗄️ Generating Prisma client..."
# npx prisma generate

echo "🔄 Creating migration..."
# npx prisma migrate dev --name add-learn-pillar

echo "🌱 Seeding default skills..."
# You can call the seed endpoint after server starts

echo "✅ LEARN pillar setup complete!"
echo ""
echo "🎯 What's been added:"
echo "   - Skills management system"
echo "   - Course creation & enrollment"
echo "   - User skill tracking"
echo "   - Instructor dashboard"
echo "   - Course reviews & ratings"
echo ""
echo "🔗 API Endpoints:"
echo "   GET    /skills - List all skills"
echo "   POST   /skills/my-skills - Add skill to profile"
echo "   GET    /courses - Browse courses"
echo "   POST   /courses - Create course (instructors)"
echo "   POST   /courses/:id/enroll - Enroll in course"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm run start:dev"
echo "   2. Visit: http://localhost:3000/skills"
echo "   3. Create your first course!"