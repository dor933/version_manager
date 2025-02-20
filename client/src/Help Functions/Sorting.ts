import { VersionData } from "../Types/MainDataTypes";     

export const sortedVersions = (filteredVersions: VersionData[], property: keyof VersionData, order: 'asc' | 'desc') => {
    return  [...filteredVersions].sort((a, b) => {
    if (property === 'ReleaseDate' || property === 'EndOfSupportDate' || property === 'Extended_Support_End_Date') {
      const dateA = a[property] ? new Date(a[property] as string|number|Date).getTime() : Infinity;
      const dateB = b[property] ? new Date(b[property] as string|number|Date).getTime() : Infinity;
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }

    else if(property==='ProductName'){
      return order === 'asc' ? (a[property] || '') > (b[property] || '') ? 1 : -1 : (b[property] || '') > (a[property] || '') ? 1 : -1;
    }
    else if(property==='VendorName'){
      return order === 'asc' ? (a[property] || '') > (b[property] || '') ? 1 : -1 : (b[property] || '') > (a[property] || '') ? 1 : -1;
    }
    else if(property==='LevelOfSupport'){
      return order === 'asc' ? (a[property] || '') > (b[property] || '') ? 1 : -1 : (b[property] || '') > (a[property] || '') ? 1 : -1;
    }
    

    return order === 'asc'
      ? (a[property] || '') > (b[property] || '') ? 1 : -1
      : (b[property] || '') > (a[property] || '') ? 1 : -1;
  });
}
  