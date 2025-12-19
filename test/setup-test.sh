#!/bin/bash

echo "🚀 Setting up test environment..."
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✓ .env file exists"
else
    echo "⚠  .env file not found"
    echo ""
    echo "Creating .env from example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created .env from .env.example"
        echo ""
        echo "⚠  IMPORTANT: Edit .env and set your DATABASE_URL!"
        echo ""
        echo "Example:"
        echo "  DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb"
        echo ""
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Check if DATABASE_URL is set
source .env 2>/dev/null
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set in .env file"
    echo ""
    echo "Please edit .env and add:"
    echo "  DATABASE_URL=postgresql://username:password@localhost:5432/database_name"
    echo ""
    exit 1
fi

echo "✓ DATABASE_URL is set"
echo ""
echo "Testing database connection..."
bun -e "
import postgres from 'postgres';
const sql = postgres(Bun.env.DATABASE_URL, { max: 1, connect_timeout: 5 });
try {
  await sql\`SELECT 1\`;
  console.log('✓ Database connection successful!');
  await sql.end();
  process.exit(0);
} catch (error) {
  console.log('❌ Database connection failed!');
  console.log('Error:', error.message);
  process.exit(1);
}
"

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════"
    echo "✅ Setup complete! Ready to run tests."
    echo "═══════════════════════════════════════"
    echo ""
    echo "Run tests with:"
    echo "  bun test.ts"
    echo ""
else
    echo ""
    echo "═══════════════════════════════════════"
    echo "❌ Setup failed - please fix database connection"
    echo "═══════════════════════════════════════"
    echo ""
    exit 1
fi
