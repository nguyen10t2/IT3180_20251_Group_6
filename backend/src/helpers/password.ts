import { randomBytes } from 'crypto';
import { promisify } from 'util';

export const generateRandomString = async (length: number = 64) => {
    const buf = await promisify(randomBytes)(length);
    return buf.toString('hex').slice(0, length);
}

export const generateRandomNumber = (length: number = 6) => {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const key = await generateRandomString(128);

export const verifyPassword = async (password: string, hashedPassword: string) => {
    return await Bun.password.verify(hashedPassword, password);
}

export const hashedPassword = async (password: string) => {
    return await Bun.password.hash(password)
}