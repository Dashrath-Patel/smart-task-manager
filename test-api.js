#!/usr/bin/env node

const baseUrl = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Task Management API...\n');

  let createdTaskId = null;

  try {
    // Test 1: Create a new task
    console.log('1️⃣ Testing POST /api/tasks');
    const createResponse = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Task from API Test',
        description: 'This is a test task created by the API test script',
        status: 'pending',
        userId: 'test-user-123'
      })
    });

    const createResult = await createResponse.json();
    if (createResponse.ok) {
      console.log('✅ Task created successfully');
      console.log(`   Task ID: ${createResult.data.id}`);
      createdTaskId = createResult.data.id;
    } else {
      console.log('❌ Failed to create task:', createResult.error?.message);
      return;
    }

    // Test 2: Get all tasks
    console.log('\n2️⃣ Testing GET /api/tasks');
    const getAllResponse = await fetch(`${baseUrl}/tasks?limit=5`);
    const getAllResult = await getAllResponse.json();
    
    if (getAllResponse.ok) {
      console.log('✅ Retrieved tasks successfully');
      console.log(`   Total tasks: ${getAllResult.data.pagination.total}`);
      console.log(`   Retrieved: ${getAllResult.data.tasks.length} tasks`);
    } else {
      console.log('❌ Failed to get tasks:', getAllResult.error?.message);
    }

    // Test 3: Get task by ID
    console.log('\n3️⃣ Testing GET /api/tasks/:id');
    const getByIdResponse = await fetch(`${baseUrl}/tasks/${createdTaskId}`);
    const getByIdResult = await getByIdResponse.json();
    
    if (getByIdResponse.ok) {
      console.log('✅ Retrieved task by ID successfully');
      console.log(`   Task title: ${getByIdResult.data.title}`);
    } else {
      console.log('❌ Failed to get task by ID:', getByIdResult.error?.message);
    }

    // Test 4: Update task
    console.log('\n4️⃣ Testing PUT /api/tasks/:id');
    const updateResponse = await fetch(`${baseUrl}/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Updated Test Task',
        status: 'in_progress'
      })
    });

    const updateResult = await updateResponse.json();
    if (updateResponse.ok) {
      console.log('✅ Task updated successfully');
      console.log(`   New title: ${updateResult.data.title}`);
      console.log(`   New status: ${updateResult.data.status}`);
    } else {
      console.log('❌ Failed to update task:', updateResult.error?.message);
    }

    // Test 5: Filter tasks
    console.log('\n5️⃣ Testing GET /api/tasks with filters');
    const filterResponse = await fetch(`${baseUrl}/tasks?status=in_progress&userId=test-user-123`);
    const filterResult = await filterResponse.json();
    
    if (filterResponse.ok) {
      console.log('✅ Filtered tasks successfully');
      console.log(`   Found ${filterResult.data.tasks.length} in_progress tasks for test-user-123`);
    } else {
      console.log('❌ Failed to filter tasks:', filterResult.error?.message);
    }

    // Test 6: Delete task
    console.log('\n6️⃣ Testing DELETE /api/tasks/:id');
    const deleteResponse = await fetch(`${baseUrl}/tasks/${createdTaskId}`, {
      method: 'DELETE'
    });

    const deleteResult = await deleteResponse.json();
    if (deleteResponse.ok) {
      console.log('✅ Task deleted successfully');
    } else {
      console.log('❌ Failed to delete task:', deleteResult.error?.message);
    }

    // Test 7: Error handling (try to get deleted task)
    console.log('\n7️⃣ Testing error handling');
    const errorResponse = await fetch(`${baseUrl}/tasks/${createdTaskId}`);
    const errorResult = await errorResponse.json();
    
    if (errorResponse.status === 404) {
      console.log('✅ Error handling works correctly (404 for deleted task)');
    } else {
      console.log('❌ Error handling test failed');
    }

    console.log('\n🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure your development server is running with: npm run dev');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };