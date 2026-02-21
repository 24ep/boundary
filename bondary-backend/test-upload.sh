#!/bin/bash

echo "🔍 Testing File Upload System"
echo "=================================="

# Test upload info endpoint (should return configuration)
echo "📊 Testing Upload Info Endpoint..."
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3000/api/admin/upload/info | tail -1
echo ""

# Test file listing (should return empty or existing files)
echo "📁 Testing File Listing..."
curl -s -w "HTTP Status: %{http_code}\n" http://localhost:3000/api/admin/upload/list | tail -1
echo ""

# Test upload without authentication (should return 401)
echo "🔒 Testing Upload Without Auth..."
curl -s -w "HTTP Status: %{http_code}\n" -X POST http://localhost:3000/api/admin/upload | tail -1
echo ""

echo "✅ File Upload System Tests Complete!"
echo ""
echo "Expected Results:"
echo "- Upload Info: 401 (unauthorized, not 404)"
echo "- File Listing: 401 (unauthorized, not 404)"
echo "- Upload Without Auth: 401 (unauthorized)"
echo ""
echo "To test actual file uploads, you need to:"
echo "1. Get an admin auth token first"
echo "2. Use curl with -F flag to upload files"
echo "3. Check the uploads directory for saved files"
echo ""
echo "Example with authentication:"
echo "curl -X POST \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "  -F 'file=@test.jpg' \\"
echo "  http://localhost:3000/api/admin/upload"
