import { randomBytes } from 'crypto'

export const generateRandomString = async (length: number = 64) => {
    return await Bun.password.hash(randomBytes(length).toString('hex'));
}

const key = await generateRandomString(128);
console.log(key);



const password = '111111';
const hashedPassword = await Bun.password.hash(password);
console.log('Hashed Password:', hashedPassword);

export const verifyPassword = async (password: string, hashedPassword: string) => {
    return await Bun.password.verify(hashedPassword, password);
}