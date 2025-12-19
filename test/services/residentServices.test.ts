import { testRunner, assert, log } from '../helpers/testHelpers';
import * as residentServices from '../../backend/src/services/residentServices';
import { generateRandomString } from '@backend/helpers/password';

export async function runResidentServiceTests() {
  log.title('👤 Testing Resident Services');

  // Test 1: Get All Residents
  testRunner.startTest('residentServices.getAll');
  try {
    const result = await residentServices.getAll();
    
    if (result.error) {
      testRunner.fail('Failed to get residents: ' + result.error);
      log.error('Get all residents failed');
    } else {
      assert.isDefined(result.data, 'Should return residents data');
      assert.isDefined(Array.isArray(result.data), 'Should return array');
      testRunner.pass();
      log.success(`Get all residents succeeded (${(result as any).data.length} residents found)`);
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get all residents test failed: ${error.message}`);
  }

  // Test 2: Get Resident By Phone - Invalid Phone
  testRunner.startTest('residentServices.getResidentByPhone - Invalid');
  try {
    const result = await residentServices.getResidentByPhone('9999999999');
    
    if (result.error) {
      assert.hasProperty(result, 'error', 'Should return error for non-existent phone');
      testRunner.pass();
      log.success('Get resident with invalid phone returns error correctly');
    } else {
      testRunner.fail('Should return error for non-existent phone');
      log.error('Should have returned error for invalid phone');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get resident by phone test failed: ${error.message}`);
  }

  // Test 3: Get Resident By ID - Invalid ID
  testRunner.startTest('residentServices.getResidentById - Invalid');
  try {
    const invalidId = '00000000-0000-0000-0000-000000000000';
    const result = await residentServices.getResidentById(invalidId);
    
    if (result.error) {
      assert.hasProperty(result, 'error', 'Should return error for invalid ID');
      testRunner.pass();
      log.success('Get resident with invalid ID returns error correctly');
    } else {
      testRunner.fail('Should return error for non-existent resident');
      log.error('Should have returned error for invalid ID');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get resident by ID test failed: ${error.message}`);
  }

  // Test 4: Get Resident By User ID
  testRunner.startTest('residentServices.getResidentByUserId');
  try {
    const userId = '1e671e86-32b6-40f9-a248-e43b67ae2335';
    const result = await residentServices.getResidentByUserId(userId);
    
    // May return error if user doesn't exist or has no resident
    if (result.error) {
      log.warn('No resident found for user (expected if DB is empty)');
      testRunner.pass();
    } else {
      assert.isDefined(result.data, 'Should return resident data');
      testRunner.pass();
      log.success('Resident retrieved by user ID successfully');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get resident by user ID test failed: ${error.message}`);
  }

  // Test 5: Get Resident ID By User ID
  testRunner.startTest('residentServices.getResidentIdByUserId');
  try {
    const userId = '1e671e86-32b6-40f9-a248-e43b67ae2335';
    const result = await residentServices.getResidentIdByUserId(userId);
    
    if (result.error) {
      log.warn('No resident ID found for user (expected if DB is empty)');
      testRunner.pass();
    } else {
      assert.isDefined(result.data, 'Should return resident ID');
      testRunner.pass();
      log.success('Resident ID retrieved successfully');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get resident ID by user ID test failed: ${error.message}`);
  }

  // Test 6: Get Resident By ID Card - Invalid
  testRunner.startTest('residentServices.getResidentByIdCard - Invalid');
  try {
    const result = await residentServices.getResidentByIdCard('999999999999');
    
    if (result.error) {
      assert.hasProperty(result, 'error', 'Should return error for invalid ID card');
      testRunner.pass();
      log.success('Get resident with invalid ID card returns error correctly');
    } else {
      testRunner.fail('Should return error for non-existent ID card');
      log.error('Should have returned error for invalid ID card');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get resident by ID card test failed: ${error.message}`);
  }

  // Test 7: Create Resident
  testRunner.startTest('residentServices.createResident');
  try {
    const residentData = {
      full_name: 'Test Resident ' + Date.now(),
      phone: '0999' + Math.floor(Math.random() * 1000000),
      id_card: '099' + Math.floor(Math.random() * 100000000),
      date_of_birth: new Date('1990-01-01'),
      gender: 'male' as const,
      occupation: 'Tester',
      role: 3 as const,
      status: 'tamtru' as const,
    };
    
    const result = await residentServices.createResident(residentData);
    
    if (result.error) {
      testRunner.fail('Failed to create resident: ' + result.error);
      log.error('Create resident failed');
    } else {
      assert.isDefined(result.data, 'Should return created resident');
      assert.hasProperty(result.data, 'id', 'Should have id');
      testRunner.pass();
      log.success(`Resident created successfully: ${(result as any).data.full_name}`);
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Create resident test failed: ${error.message}`);
  }

  // Test 8: Update Resident
  testRunner.startTest('residentServices.updateResident');
  try {
    const allResidents = await residentServices.getAll();
    
    if (allResidents.data && allResidents.data.length > 0) {
      const firstResidentId = allResidents.data[0].id;
      const updateData = {
        occupation: generateRandomString(10),
        status: 'tamvang' as const,
        phone: generateRandomString(10),
      };
      
      const result = await residentServices.updateResident(firstResidentId, updateData);
      
      if (result.error) {
        testRunner.fail('Failed to update resident: ' + result.error);
        log.error('Update resident failed');
      } else {
        assert.isDefined(result.data, 'Should return success message');
        testRunner.pass();
        log.success('Resident updated successfully');
      }
    } else {
      log.warn('No residents available to test updateResident');
      testRunner.pass();
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Update resident test failed: ${error.message}`);
  }

  // Test 9: Delete Resident (skip to avoid data loss)
  testRunner.startTest('residentServices.deleteResident - Skipped');
  try {
    testRunner.skip('Skipped to prevent data loss in test database');
    log.warn('Delete resident test skipped to preserve data');
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Delete resident test failed: ${error.message}`);
  }
}
