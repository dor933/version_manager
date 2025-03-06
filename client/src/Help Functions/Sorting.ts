import { VersionData } from "../Types/MainDataTypes";     

export const sortedVersions = (
  filteredVersions: VersionData[],
  property: keyof VersionData,
  order: 'asc' | 'desc'
) => {
  return [...filteredVersions].sort((a, b) => {
    const aValue = a[property];
    const bValue = b[property];

    if (
      property === 'ReleaseDate' ||
      property === 'EndOfSupportDate' ||
      property === 'ExtendedSupportEndDate'
    ) {
      const aTime = aValue ? new Date(aValue as string | number | Date).getTime() : null;
      const bTime = bValue ? new Date(bValue as string | number | Date).getTime() : null;

      if (aTime === null && bTime === null) return 0;
      if (aTime === null) return 1;
      if (bTime === null) return -1;

      return order === 'asc' ? aTime - bTime : bTime - aTime;
    }

    const aStr = (aValue || '').toString();
    const bStr = (bValue || '').toString();
    const compareResult = aStr.localeCompare(bStr);

    return order === 'asc' ? compareResult : -compareResult;
  });
};