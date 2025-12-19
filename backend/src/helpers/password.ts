import { randomBytes } from 'crypto'

export const generateRandomString =  (length: number = 64) => {
    return randomBytes(length / 2).toString('hex').slice(0, length);
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

const key = generateRandomString(128);
console.log(key);



const password = '111111';
const hashedPassword = await Bun.password.hash(password);
console.log('Hashed Password:', hashedPassword);

export const verifyPassword = async (password: string, hashedPassword: string) => {
    return await Bun.password.verify(hashedPassword, password);
}