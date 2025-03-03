const isHebrewText = (text: string): boolean => {
    if (!text) return false;
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text);
};

export default isHebrewText;