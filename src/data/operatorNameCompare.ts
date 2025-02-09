const getLocaleComparableString = (s: string) =>
    s.normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^0-9a-z\s]/gi, "")
        .toLowerCase();

const localeStringSearch = (
    fn: typeof String.prototype.startsWith | typeof String.prototype.includes | typeof String.prototype.endsWith,
    main: string,
    sub: string
) => {
    // ensure sub is a string and not empty
    if (sub === "") return true;
    if (!sub || !main.length) return false;
    sub = "" + sub;

    // if sub is longer than main, it can't be contained
    if (sub.length > main.length) return false;

    return fn.call(
        getLocaleComparableString(main), 
        getLocaleComparableString(sub)
    );
};

const localeContains = (main: string, sub: string) =>
    localeStringSearch(String.prototype.includes, main, sub);

const localeStartsWith = (main: string, sub: string) =>
    localeStringSearch(String.prototype.startsWith, main, sub);

const localeEndsWith = (main: string, sub: string) =>
    localeStringSearch(String.prototype.endsWith, main, sub);

const localeCompare = (a: string, b: string) =>
    getLocaleComparableString(a).localeCompare(getLocaleComparableString(b));

export { localeContains, localeStartsWith, localeEndsWith, localeCompare };