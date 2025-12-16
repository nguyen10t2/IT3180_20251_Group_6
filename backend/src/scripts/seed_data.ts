import { db } from "../database/db";
import { Users } from "../models/users";

const email = 'xyz@test.com';
const password = await Bun.password.hash('111111');
const fullname = 'TestUser';
const role = 3;

try {
    await db.insert(Users).values({
        email: email,
        password: password,
        name: fullname,
        role: role
    });
} catch (error) {
    console.error('Error seeding data:', error);
}
