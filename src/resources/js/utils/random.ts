export function hashString(input: string): number {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
    let a = seed;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function seededRandomInt(seedText: string, min: number, max: number): number {
    const rand = mulberry32(hashString(seedText));
    return Math.floor(rand() * (max - min + 1)) + min;
}

export function seededChance(seedText: string, probability: number): boolean {
    const rand = mulberry32(hashString(seedText));
    return rand() < probability;
}
