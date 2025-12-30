import { db } from "../database/db";
import { userSchema } from "../models/userSchema";

const email = 'xyz@test.com';
const password = await Bun.password.hash('111111');
const fullname = 'TestUser';
const role = 3;

try {
    await db.insert(userSchema).values({
        email,
        hashed_password: password,
        full_name: fullname,
        role
    });
} catch (error) {
    console.error('Error seeding data:', error);
}
