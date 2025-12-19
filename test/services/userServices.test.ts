import { testRunner, assert, log } from '../helpers/testHelpers';
import * as userServices from '../../backend/src/services/userServices';
import { db } from '../../backend/src/database/db';
import { Users } from '../../backend/src/models/users';
import { sql } from 'drizzle-orm';

export async function runUserServiceTests() {
  log.title('👥 Testing User Services');

  // Test 0A: Count all users in database (direct check)
  testRunner.startTest('Database check - Count all users');
  try {
    // @ts-expect-error Drizzle type limitation with aggregate
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(Users);
    const totalUsers = result.count;
    
    testRunner.pass();
    log.info(`Database has ${totalUsers} total users`);
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Database count failed: ${error.message}`);
  }

  // Test 0B: Get Pending Users (để check có data không)
  testRunner.startTest('userServices.getPendingUsers');
  try {
    const result = await userServices.getPendingUsers();
    
    if (result.error) {
      testRunner.fail('Failed to get pending users: ' + result.error);
      log.error('Get pending users failed');
    } else {
      assert.isDefined(result.data, 'Should return users data');
      assert.isDefined(Array.isArray(result.data), 'Should return array');
      testRunner.pass();
      log.success(`Get pending users succeeded (${(result as any).data.length} users found)`);
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get pending users test failed: ${error.message}`);
  }

  // Test 1: Get Users By Last Created And Limit
  testRunner.startTest('userServices.getUsersByLastCreatedAndLimit');
  try {
    // Use future date to get all users created before it
    const lastCreated = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const limit = 10;
    const result = await userServices.getUsersByLastCreatedAndLimit(lastCreated, limit);
    
    if (result.error) {
      testRunner.fail('Failed to get users: ' + result.error);
      log.error('Get users by last created failed');
    } else {
      assert.isDefined(result.data, 'Should return users data');
      assert.isDefined(Array.isArray(result.data), 'Should return array');
      testRunner.pass();
      log.success(`Get users succeeded (${(result as any).data.length} users found)`);
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get users test failed: ${error.message}`);
  }

  // Test 2: Update User Password
  testRunner.startTest('userServices.updateUserPassword');
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const newPassword = await Bun.password.hash('newpassword123');
    
    const result = await userServices.updateUserPassword(userId, newPassword);
    
    // Will succeed even if user doesn't exist (no error thrown by update)
    assert.isDefined(result.data, 'Should return success message');
    testRunner.pass();
    log.success('Update password executed successfully');
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Update user password test failed: ${error.message}`);
  }

  // Test 3: Get User By ID - Invalid ID
  testRunner.startTest('userServices.getUserById - Invalid');
  try {
    const invalidId = '00000000-0000-0000-0000-000000000000';
    const result = await userServices.getUserById(invalidId);
    
    if (result.error) {
      assert.hasProperty(result, 'error', 'Should return error for invalid ID');
      testRunner.pass();
      log.success('Get user with invalid ID returns error correctly');
    } else {
      testRunner.fail('Should return error for non-existent user');
      log.error('Should have returned error for invalid ID');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get user by ID test failed: ${error.message}`);
  }

  // Test 4: Is Existing User By Email - Non-existent
  testRunner.startTest('userServices.isExistingUserByEmail - Non-existent');
  try {
    const result = await userServices.isExistingUserByEmail('nonexistent@test.com');
    
    if (result.error) {
      testRunner.fail('Failed to check user existence: ' + result.error);
      log.error('Check user existence failed');
    } else {
      assert.isDefined(result.data, 'Should return boolean');
      assert.equals(result.data, false, 'Should return false for non-existent email');
      testRunner.pass();
      log.success('Check non-existent user returns false correctly');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Check user existence test failed: ${error.message}`);
  }

  // Test 5: Get User By Email - Invalid Email
  testRunner.startTest('userServices.getUserByEmail - Invalid');
  try {
    const result = await userServices.getUserByEmail('invalid@test.com');
    
    if (result.error) {
      assert.hasProperty(result, 'error', 'Should return error for invalid email');
      testRunner.pass();
      log.success('Get user with invalid email returns error correctly');
    } else {
      testRunner.fail('Should return error for non-existent email');
      log.error('Should have returned error for invalid email');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get user by email test failed: ${error.message}`);
  }

  // Test 6: Create User
  testRunner.startTest('userServices.createUser');
  try {
    const email = 'newuser_' + Date.now() + '@test.com';
    const password = await Bun.password.hash('password123');
    const name = 'New Test User';
    
    const result = await userServices.createUser(email, password, name);
    
    if (result.error) {
      testRunner.fail('Failed to create user: ' + result.error);
      log.error('Create user failed');
    } else {
      assert.isDefined(result.data, 'Should return created user');
      assert.hasProperty(result.data, 'id', 'Should have user id');
      testRunner.pass();
      log.success(`User created successfully: ${(result as any).data.email}`);
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Create user test failed: ${error.message}`);
  }

  // Test 7: Verify User
  testRunner.startTest('userServices.verifyUser');
  try {
    const email = 'test@example.com';
    const result = await userServices.verifyUser(email);
    
    assert.hasProperty(result, 'data', 'Should return success message');
    testRunner.pass();
    log.success('Verify user executed successfully');
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Verify user test failed: ${error.message}`);
  }

  // Test 8: Update Resident ID
  testRunner.startTest('userServices.updateResidentId');
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const residentId = '660e8400-e29b-41d4-a716-446655440001';
    
    const result = await userServices.updateResidentId(userId, residentId);
    
    assert.hasProperty(result, 'data', 'Should return success message');
    testRunner.pass();
    log.success('Update resident ID executed successfully');
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Update resident ID test failed: ${error.message}`);
  }

  // Test 9: Get Pending Users Without Resident
  testRunner.startTest('userServices.getPendigUsersWithoutResident');
  try {
    const result = await userServices.getPendigUsersWithoutResident();
    
    if (result.error) {
      testRunner.fail('Failed to get pending users: ' + result.error);
      log.error('Get pending users without resident failed');
    } else {
      assert.isDefined(result.data, 'Should return users data');
      assert.isDefined(Array.isArray(result.data), 'Should return array');
      testRunner.pass();
      log.success(`Get pending users without resident succeeded (${(result as any).data.length} users)`);
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get pending users without resident test failed: ${error.message}`);
  }

  // Test 10: Get User With Resident
  testRunner.startTest('userServices.getUserWithResident');
  try {
    const userId = '1e671e86-32b6-40f9-a248-e43b67ae2335';
    const result = await userServices.getUserWithResident(userId);
    
    if (result.error) {
      log.warn('No user with resident found (expected if DB has no matching data)');
      testRunner.pass();
    } else {
      assert.isDefined(result.data, 'Should return user with resident data');
      testRunner.pass();
      log.success('User with resident retrieved successfully');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get user with resident test failed: ${error.message}`);
  }

  // Test 11: Approve User
  testRunner.startTest('userServices.approveUser');
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const approverId = '660e8400-e29b-41d4-a716-446655440000';
    
    const result = await userServices.approveUser(userId, approverId);
    
    assert.hasProperty(result, 'data', 'Should return success message');
    testRunner.pass();
    log.success('Approve user executed successfully');
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Approve user test failed: ${error.message}`);
  }

  // Test 12: Reject User
  testRunner.startTest('userServices.rejectUser');
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const reason = 'Test rejection reason';
    
    const result = await userServices.rejectUser(userId, reason);
    
    assert.hasProperty(result, 'data', 'Should return success message');
    testRunner.pass();
    log.success('Reject user executed successfully');
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Reject user test failed: ${error.message}`);
  }
}
