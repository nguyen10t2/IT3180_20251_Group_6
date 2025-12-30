
import { db } from "../database/db";
import { houseSchema } from "../models/houseSchema";
import { residentSchema } from "../models/residentSchema";
import { userSchema } from "../models/userSchema";
import { invoiceSchema } from "../models/invoiceSchema";
import { invoiceDetailSchema } from "../models/invoiceDetailSchema";
import { invoiceTypeSchema } from "../models/invoiceTypeSchema";
import { notificationSchema } from "../models/notifycationSchema";
import { notificationReadSchema } from "../models/notificationReadSchema";
import { feedbackSchema } from "../models/feedbackSchema";
import { feedbackCommentSchema } from "../models/feedbackCommentSchema";
import { houseHoldHeadHistorySchema } from "../models/houseHoldHeadHistorySchema";
import { sql } from "drizzle-orm";

const PASSWORD_HASH = "$argon2id$v=19$m=65536,t=2,p=1$CSzocgyatIDc3ZgYp/zilb0XIAi4aDDhGrN1cWMASGI$FzhqMDsNRMAd00lUImUbmnsUVEsr1N24fnd6kQlbp1Q";

const firstNames = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Huynh", "Phan", "Vu", "Vo", "Dang"];
const lastNames = ["Van A", "Thi B", "Van C", "Thi D", "Van E", "Thi F", "Gia Bao", "Minh Khoi", "Ngoc Han", "Bao Chau"];
const streets = ["Nguyen Hue", "Le Loi", "Ham Nghi", "Pasteur", "Hai Ba Trung", "Ly Tu Trong", "Dong Khoi", "Nam Ky Khoi Nghia"];
const occupations = ["Engineer", "Doctor", "Teacher", "Student", "Business Owner", "Freelancer", "Accountant", "Nurse"];
const feedbackTitles = ["Broken Elevator", "Noisy Neighbors", "Water Leak", "Cleanliness Issue", "Parking Problem", "Security Concern"];
const feedbackContents = [
    "The elevator in block A is not working properly.",
    "Neighbors in 302 are making too much noise at night.",
    "There is a water leak in the hallway of floor 5.",
    "The lobby is not clean.",
    "Someone parked in my spot.",
    "I saw a stranger loitering around the entrance."
];
const notificationTitles = ["Maintenance Schedule", "Fire Drill", "Payment Reminder", "Community Event", "New Policy"];
const notificationContents = [
    "Elevator maintenance scheduled for next Monday.",
    "Fire drill will be held on Saturday at 10 AM.",
    "Please pay your monthly fees by the 5th.",
    "Join us for the community BBQ this Sunday.",
    "New parking policy effective immediately."
];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
    return "09" + Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
}

function generateIdCard(): string {
    return Math.floor(Math.random() * 1000000000000).toString().padStart(12, "0");
}

function generateDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function cleanDb() {
    console.log("Cleaning Database...");
    // Truncate tables in order to avoid FK constraints issues, or use CASCADE
    // We want to keep user_role and fee_types as per instructions
    const tables = [
        "invoice_details", // Matches schema
        "invoices",
        "feedback_comments",
        "feedbacks",
        "notification_reads",
        "notification", // Renamed from notifications
        "house_hold_head_history", // Renamed from household_head_history
        "refresh_tokens",
        "users",
        "resident",
        "house",
        "invoice_types" // We created this, so we can clean it too if we want to re-seed
    ];
    
    for (const table of tables) {
        try {
            await db.execute(sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`));
        } catch (e) {
            // console.log(`Note: Could not truncate table ${table} (maybe doesn't exist).`);
        }
    }
}

async function prepareDb() {
    console.log("Preparing Database...");
    
    // 1. Execute SQL files to ensure schema exists
    try {
        const sqlFiles = ["src/sql/00_extension.sql", "src/sql/01_enum.sql", "src/sql/02_table.sql"];
        for (const filePath of sqlFiles) {
            try {
                const content = await Bun.file(filePath).text();
                const statements = content.split(';').filter(s => s.trim().length > 0);
                for (const stmt of statements) {
                    try {
                        await db.execute(sql.raw(stmt));
                    } catch (e: any) {
                        // Ignore "relation already exists" (42P07) or "type already exists" (42710)
                        // console.log(`Warning executing SQL: ${e.message}`);
                    }
                }
            } catch (e) {
                console.log(`Could not read or execute ${filePath}:`, e);
            }
        }
    } catch (e) {
        console.error("Error executing SQL files:", e);
    }

    try {
        await cleanDb();

        // Create invoice_types table if not exists
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS invoice_types (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            );
        `);
        // Fix table name mismatches between SQL and Drizzle Schema
        // invoice_details matches schema now, so no rename needed
        try {
            await db.execute(sql`ALTER TABLE notifications RENAME TO notification`);
        } catch (e) {}

        // Fix column name mismatches
        try {
            await db.execute(sql`ALTER TABLE invoice_details RENAME COLUMN fee_type_id TO fee_id`);
        } catch (e) {}

        try {
            await db.execute(sql`ALTER TABLE household_head_history RENAME TO house_hold_head_history`);
        } catch (e) {}
        // Check if invoices.invoice_types is integer or varchar
        // We will just try to alter it to be compatible with Drizzle Schema
        // Note: This might fail if there is existing data that cannot be cast, but for a seed script it's acceptable to try.
        // We'll drop the default first if it exists.
        try {
            await db.execute(sql`ALTER TABLE invoices ALTER COLUMN invoice_types DROP DEFAULT`);
        } catch (e) {}
        
        // We need to change the type to integer using USING clause
        // If it was 'monthly', it will fail to cast to int. So we might need to handle that.
        // For now, let's assume we can just alter it or drop and recreate the column if it's empty.
        // A safer approach for this seed script (assuming dev env) is to force it.
        
        // Let's check if we can cast. If not, we might need to clear the table or update values.
        // But simpler: just run the ALTER command and catch error.
        try {
             await db.execute(sql`
                ALTER TABLE invoices 
                ALTER COLUMN invoice_types TYPE INTEGER USING (CASE WHEN invoice_types~E'^\\d+$' THEN invoice_types::INTEGER ELSE NULL END);
            `);
             await db.execute(sql`
                ALTER TABLE invoices
                ADD CONSTRAINT fk_invoice_types FOREIGN KEY (invoice_types) REFERENCES invoice_types(id);
             `);
        } catch (e) {
            console.log("Note: Could not alter invoices.invoice_types to integer (maybe already done or data conflict). Ignoring.");
        }

    } catch (error) {
        console.error("Error preparing DB:", error);
    }
}

async function seed() {
    console.log("Starting seed...");
    await prepareDb();

    try {
        // 1. Create Houses
        console.log("Seeding Houses...");
        const houses = [];
        for (let i = 1; i <= 50; i++) {
            const roomType = getRandomElement(["penhouse", "studio", "normal"]);
            const house = await db.insert(houseSchema).values({
                room_number: `R${100 + i}`,
                room_type: roomType,
                building: getRandomElement(["A", "B", "C"]),
                area: getRandomInt(30, 150).toString(),
                has_vehicle: Math.random() > 0.5,
                motorbike_count: getRandomInt(0, 2),
                car_count: getRandomInt(0, 1),
                status: "active",
                notes: "Seeded house"
            }).returning();
            houses.push(house[0]);
        }

        // 2. Create Residents
        console.log("Seeding Residents...");
        const residents = [];
        for (let i = 0; i < 100; i++) {
            const house = getRandomElement(houses);
            const resident = await db.insert(residentSchema).values({
                house_id: house.id,
                full_name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
                id_card: generateIdCard(),
                date_of_birth: generateDate(new Date(1960, 0, 1), new Date(2000, 0, 1)),
                phone: generatePhone(),
                email: `resident${i}@example.com`,
                gender: getRandomElement(["male", "female", "other"]),
                occupation: getRandomElement(occupations),
                house_role: getRandomElement(["owner", "member", "tenant"]),
                residence_status: getRandomElement(["thuongtru", "tamtru", "tamvang"]),
                move_in_date: generateDate(new Date(2020, 0, 1), new Date()),
            }).returning();
            residents.push(resident[0]);
        }

        // Update House Head Residents (randomly assign one resident as head for each house)
        for (const house of houses) {
            const houseResidents = residents.filter(r => r.house_id === house.id);
            if (houseResidents.length > 0) {
                const head = houseResidents[0]; // Just pick the first one
                await db.update(houseSchema)
                    .set({ head_resident_id: head.id })
                    .where(sql`${houseSchema.id} = ${house.id}`);
            }
        }

        // 3. Create Users
        console.log("Seeding Users...");
        const users = [];
        // Create users for some residents
        for (let i = 0; i < 50; i++) {
            const resident = residents[i];
            const user = await db.insert(userSchema).values({
                email: `user${i}@example.com`,
                hashed_password: PASSWORD_HASH,
                full_name: resident.full_name,
                resident_id: resident.id,
                role: 3, // Default role
                status: "active",
                email_verified: true,
            }).returning();
            users.push(user[0]);
        }
        // Create an admin user
        const adminUser = await db.insert(userSchema).values({
            email: "admin@example.com",
            hashed_password: PASSWORD_HASH,
            full_name: "Admin User",
            role: 1, // Admin role
            status: "active",
            email_verified: true,
        }).returning();
        users.push(adminUser[0]);

        // 3.5 Create Invoice Types
        console.log("Seeding Invoice Types...");
        const invoiceTypesData = ["Monthly Fee", "Water Fee", "Electricity Fee", "Parking Fee", "Service Fee"];
        const invoiceTypes = [];
        for (const name of invoiceTypesData) {
            const type = await db.insert(invoiceTypeSchema).values({ name }).onConflictDoNothing().returning();
            if (type.length > 0) {
                invoiceTypes.push(type[0]);
            } else {
                // If it already exists, try to fetch it (simplified: just assume it exists and we might skip or query it)
                // For simplicity in this seed script, we'll just query it back if insert failed (likely due to unique constraint)
                const existing = await db.select().from(invoiceTypeSchema).where(sql`${invoiceTypeSchema.name} = ${name}`);
                if (existing.length > 0) invoiceTypes.push(existing[0]);
            }
        }
        console.log("Seeded Invoice Types:", invoiceTypes);

        // 4. Create Invoices
        console.log("Seeding Invoices...");
        const invoices = [];
        for (let i = 0; i < 100; i++) {
            const house = getRandomElement(houses);
            const invType = getRandomElement(invoiceTypes);
            const invoice = await db.insert(invoiceSchema).values({
                invoice_number: `INV-${Date.now()}-${i}`,
                house_id: house.id,
                period_month: getRandomInt(1, 12),
                period_year: 2024,
                invoice_types: invType.id,
                total_amount: getRandomInt(100000, 5000000).toString(),
                status: getRandomElement(["pending", "paid", "overdue"]),
                due_date: generateDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
                created_by: adminUser[0].id,
            }).returning();
            invoices.push(invoice[0]);
        }

        // 5. Create Invoice Details
        console.log("Seeding Invoice Details...");
        for (const invoice of invoices) {
            const numDetails = getRandomInt(1, 3);
            for (let j = 0; j < numDetails; j++) {
                const quantity = getRandomInt(1, 10);
                const price = getRandomInt(10000, 100000);
                await db.insert(invoiceDetailSchema).values({
                    invoice_id: invoice.id,
                    fee_id: getRandomInt(1, 5), // Assuming fee_types 1-5 exist
                    quantity: quantity.toString(),
                    price: price.toString(),
                    total: (quantity * price).toString(),
                });
            }
        }

        // 6. Create Notifications
        console.log("Seeding Notifications...");
        const notifications = [];
        for (let i = 0; i < 50; i++) {
            const notification = await db.insert(notificationSchema).values({
                title: getRandomElement(notificationTitles),
                content: getRandomElement(notificationContents),
                type: getRandomElement(["general", "emergency", "event", "payment"]),
                target: "all",
                created_by: adminUser[0].id,
                published_at: new Date(),
            }).returning();
            notifications.push(notification[0]);
        }

        // 7. Create Notification Reads
        console.log("Seeding Notification Reads...");
        for (let i = 0; i < 100; i++) {
            const notification = getRandomElement(notifications);
            const user = getRandomElement(users);
            try {
                await db.insert(notificationReadSchema).values({
                    notification_id: notification.id,
                    user_id: user.id,
                    read_at: new Date(),
                });
            } catch (e) {
                // Ignore duplicates
            }
        }

        // 8. Create Feedbacks
        console.log("Seeding Feedbacks...");
        const feedbacks = [];
        for (let i = 0; i < 50; i++) {
            const user = getRandomElement(users);
            // Find house for user
            const resident = residents.find(r => r.id === user.resident_id);
            const houseId = resident ? resident.house_id : null;

            if (!houseId) continue;

            const feedback = await db.insert(feedbackSchema).values({
                user_id: user.id,
                house_id: houseId,
                type: getRandomElement(["complaint", "suggestion", "maintenance"]),
                priority: getRandomElement(["low", "medium", "high"]),
                title: getRandomElement(feedbackTitles),
                content: getRandomElement(feedbackContents),
                status: getRandomElement(["pending", "in_progress", "resolved"]),
                attachments: [],
            }).returning();
            feedbacks.push(feedback[0]);
        }

        // 9. Create Feedback Comments
        console.log("Seeding Feedback Comments...");
        for (const feedback of feedbacks) {
            const numComments = getRandomInt(0, 3);
            for (let j = 0; j < numComments; j++) {
                await db.insert(feedbackCommentSchema).values({
                    feedback_id: feedback.id,
                    user_id: adminUser[0].id,
                    content: "We are looking into this.",
                    is_internal: Math.random() > 0.5,
                });
            }
        }

        // 10. Create Household Head History
        console.log("Seeding Household Head History...");
        for (let i = 0; i < 20; i++) {
            const house = getRandomElement(houses);
            const houseResidents = residents.filter(r => r.house_id === house.id);
            if (houseResidents.length >= 2) {
                const oldHead = houseResidents[0];
                const newHead = houseResidents[1];
                await db.insert(houseHoldHeadHistorySchema).values({
                    house_id: house.id,
                    previous_head_id: oldHead.id, // Note: Schema might expect User ID in TS but Resident ID in DB. Using Resident ID here as per SQL logic.
                    new_head_id: newHead.id,
                    reason: "Change of ownership",
                    changed_by: adminUser[0].id,
                });
            }
        }

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        process.exit(0);
    }
}

seed();
