export const compareStringsIgnoringAccentsAndCase = (a: string, b: string): number => {
  let aModified = a
    ?.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
  let bModified = b
    ?.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
  return aModified?.localeCompare(bModified);
};
