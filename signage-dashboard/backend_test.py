#!/usr/bin/env python3
"""
Backend API Testing for Digital Signage Dashboard
Tests the FastAPI backend endpoints
"""

import requests
import json
import os
from datetime import datetime
import sys

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

def test_root_endpoint():
    """Test the root API endpoint"""
    print("Testing root endpoint...")
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Root endpoint working correctly")
                return True
            else:
                print("❌ Root endpoint returned unexpected message")
                return False
        else:
            print(f"❌ Root endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint test failed: {str(e)}")
        return False

def test_create_status_check():
    """Test creating a status check"""
    print("\nTesting create status check...")
    try:
        payload = {
            "client_name": "test_client_dashboard"
        }
        
        response = requests.post(f"{API_URL}/status", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "client_name" in data and "timestamp" in data:
                if data["client_name"] == "test_client_dashboard":
                    print("✅ Create status check working correctly")
                    return True, data["id"]
                else:
                    print("❌ Create status check returned wrong client_name")
                    return False, None
            else:
                print("❌ Create status check missing required fields")
                return False, None
        else:
            print(f"❌ Create status check failed with status {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ Create status check test failed: {str(e)}")
        return False, None

def test_get_status_checks():
    """Test getting all status checks"""
    print("\nTesting get status checks...")
    try:
        response = requests.get(f"{API_URL}/status", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of status checks: {len(data)}")
            
            if isinstance(data, list):
                if len(data) > 0:
                    # Check if our test record exists
                    test_record = next((item for item in data if item.get("client_name") == "test_client_dashboard"), None)
                    if test_record:
                        print("✅ Get status checks working correctly - found test record")
                        return True
                    else:
                        print("⚠️ Get status checks working but test record not found")
                        return True
                else:
                    print("✅ Get status checks working correctly - empty list")
                    return True
            else:
                print("❌ Get status checks returned non-list response")
                return False
        else:
            print(f"❌ Get status checks failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get status checks test failed: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print(f"Testing Backend API at: {API_URL}")
    print("=" * 50)
    
    results = []
    
    # Test root endpoint
    results.append(test_root_endpoint())
    
    # Test create status check
    create_success, record_id = test_create_status_check()
    results.append(create_success)
    
    # Test get status checks
    results.append(test_get_status_checks())
    
    print("\n" + "=" * 50)
    print("BACKEND TEST SUMMARY:")
    print(f"✅ Passed: {sum(results)}")
    print(f"❌ Failed: {len(results) - sum(results)}")
    
    if all(results):
        print("\n🎉 All backend tests passed!")
        return True
    else:
        print("\n⚠️ Some backend tests failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)