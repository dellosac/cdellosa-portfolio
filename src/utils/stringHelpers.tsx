export function truncate(str: string, maxLength: number): string {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + "...";
    }
    return str;
}

export function truncateAtWord(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;

    const truncated = str.slice(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(" ");

    return truncated.slice(0, lastSpace) + "...";
}
