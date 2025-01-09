//create a context for the auth

import * as React from 'react';
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<{
  versions: any[] | null;
  setVersions: React.Dispatch<React.SetStateAction<any[] | null>>;
  filtervalue: string;
  setFiltervalue: React.Dispatch<React.SetStateAction<string>>;
  chosenversion: any;
  setChosenversion: React.Dispatch<React.SetStateAction<any>>;
  vendor: string;
  setVendor: React.Dispatch<React.SetStateAction<string>>;
}>({
  versions: null,
  setVersions: () => null,
  filtervalue: '',
  setFiltervalue: () => null,
  chosenversion: null,
  setChosenversion: () => null,
  vendor: '',
  setVendor: () => '',
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [versions, setVersions] = useState<any[] | null>(null);
  const [filtervalue, setFiltervalue] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
    const [chosenversion, setChosenversion] = useState<any>(null);
  return <AuthContext.Provider value={{ versions, setVersions, filtervalue, setFiltervalue, chosenversion, setChosenversion, vendor, setVendor }}>{children}</AuthContext.Provider>;
};


