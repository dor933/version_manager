import * as React from 'react';
import TextField from '@mui/material/TextField';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { createTheme, ThemeProvider, Theme, useTheme } from '@mui/material/styles';
import { customTheme } from '../css/FilterTheme';
import { FilterProps } from '../Component Props/HelpComponentsProps';

  export default function Filter({filtervalue, setFiltervalue}: FilterProps) {

    const onchangefilter = (e: any) => {
      console.log('e', e.target.value);
      setFiltervalue(e.target.value);
    }
    return (
      <ThemeProvider theme={customTheme(useTheme())}>
        <TextField label="Search by version,product, or vendor name" variant="filled" sx={{width:'80%',height:'100%', border:'none', backgroundColor:'transparent'}} value={filtervalue} onChange={(e)=> onchangefilter(e)} />
      </ThemeProvider>
    );
  }
