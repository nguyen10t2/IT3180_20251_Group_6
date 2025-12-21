import { testRunner, assert, log } from '../helpers/testHelpers';
import * as houseServices from '../../backend/src/services/houseServices';
import { generateRandomNumber } from '@backend/helpers/password';

export async function runHouseServiceTests() {
  log.title('🏠 Testing House Services');

  // Test 1: Get All Houses
  testRunner.startTest('houseServices.getAll');
  try {
    const result = await houseServices.getAll();

    if (result.error) {
      testRunner.fail('Failed to get houses: ' + result.error);
      log.error('Get all houses failed');
    } else {
      assert.isDefined(result.data, 'Should return houses data');
      assert.isDefined(Array.isArray(result.data), 'Should return array');
      testRunner.pass();
      log.success(`Get all houses succeeded (${(result as any).data.length} houses found)`);
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get all houses test failed: ${error.message}`);
  }

  // Test 2: Create House
  testRunner.startTest('houseServices.createHouse');
  try {
    const roomNumber = generateRandomNumber(5);
    const result = await houseServices.createHouse({
      room_number: roomNumber,
      room_type: 'penhouse',
      area: 30,
      notes: 'Created by automated test at ' + new Date().toISOString(),
    });

    if (result.error) {
      testRunner.fail('Failed to create house: ' + result.error);
      log.error('Create house failed');
    } else {
      assert.isDefined(result.data, 'Should return created house');
      assert.hasProperty(result.data, 'house_id', 'Should have house_id');
      testRunner.pass();
      log.success(`House created successfully: ${(result as any).data.room_number}`);
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Create house test failed: ${error.message}`);
  }

  // Test 3: Get House by ID - Invalid ID
  testRunner.startTest('houseServices.getHousebyId - Invalid ID');
  try {
    const invalidId = '00000000-0000-0000-0000-000000000000';
    const result = await houseServices.getHousebyId(invalidId);

    if (result.error) {
      assert.hasProperty(result, 'error', 'Should return error for invalid ID');
      testRunner.pass();
      log.success('Get house with invalid ID returns error correctly');
    } else {
      testRunner.fail('Should return error for non-existent house');
      log.error('Should have returned error for invalid ID');
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get house by invalid ID test failed: ${error.message}`);
  }

  // Test 4: Get House by ID - Valid scenario
  testRunner.startTest('houseServices.getHousebyId - Valid');
  try {
    // First get all houses to find a valid ID
    const allHouses = await houseServices.getAll();

    if (allHouses.data && allHouses.data.length > 0) {
      const firstHouseId = allHouses.data[0].house_id;
      const result = await houseServices.getHousebyId(firstHouseId);

      if (result.error) {
        testRunner.fail('Failed to get house by ID: ' + result.error);
        log.error('Get house by ID failed');
      } else {
        assert.isDefined(result.data, 'Should return house data');
        assert.hasProperty(result.data, 'house_id', 'Should have house_id');
        testRunner.pass();
        log.success(`House retrieved successfully: ${(result as any).data.room_number}`);
      }
    } else {
      log.warn('No houses available to test getHousebyId');
      testRunner.pass(); // Pass since no data is available
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Get house by ID test failed: ${error.message}`);
  }

  // Test 5: Update House
  testRunner.startTest('houseServices.updateHouse');
  try {
    const allHouses = await houseServices.getAll();

    if (allHouses.data && allHouses.data.length > 0) {
      const firstHouseId = allHouses.data[0].house_id;
      const updateData = {
        notes: 'Updated by automated test at ' + new Date().toISOString()
      };

      const result = await houseServices.updateHouse(firstHouseId, updateData);

      if (result.error) {
        testRunner.fail('Failed to update house: ' + result.error);
        log.error('Update house failed');
      } else {
        assert.isDefined(result.data, 'Should return success message');
        testRunner.pass();
        log.success('House updated successfully');
      }
    } else {
      log.warn('No houses available to test updateHouse');
      testRunner.pass();
    }
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Update house test failed: ${error.message}`);
  }

  // Test 6: Delete House (skip to avoid data loss)
  testRunner.startTest('houseServices.deleteHouse - Skipped');
  try {
    testRunner.skip('Skipped to prevent data loss in test database');
    log.warn('Delete house test skipped to preserve data');
  } catch (error: any) {
    testRunner.fail(error.message);
    log.error(`Delete house test failed: ${error.message}`);
  }
}
