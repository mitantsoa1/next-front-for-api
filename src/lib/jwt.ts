import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    const jwt = new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt();

    if (payload.expires instanceof Date) {
        jwt.setExpirationTime(Math.floor(payload.expires.getTime() / 1000));
    } else if (typeof payload.expires === 'string' && !isNaN(Date.parse(payload.expires)) && !/^\d+[smhdwy]?$/.test(payload.expires)) {
        jwt.setExpirationTime(Math.floor(new Date(payload.expires).getTime() / 1000));
    } else if (payload.expires) {
        jwt.setExpirationTime(payload.expires);
    } else {
        jwt.setExpirationTime("1h");
    }

    return await jwt.sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
            clockTolerance: 30, // 30 seconds tolerance
        });
        return payload;
    } catch (error) {
        return null;
    }
}