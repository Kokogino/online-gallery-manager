export const simplifyString = (s: string): string =>
  s
    ?.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();

export const containsStringsIgnoringAccentsAndCase = (a: string, b: string): boolean => {
  const aSimple = simplifyString(a);
  const bSimple = simplifyString(b);
  return aSimple?.includes(bSimple ?? '');
};

export const compareStringsIgnoringAccentsAndCase = (a: string, b: string): number => {
  const aSimple = simplifyString(a);
  const bSimple = simplifyString(b);
  return aSimple?.localeCompare(bSimple ?? '');
};
