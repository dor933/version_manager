import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';





interface StyledTabsProps {
  children?: React.ReactNode;
  value: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
}

const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
    centered
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#635ee7',
  },
});

interface StyledTabProps {
  label: string;
  value: string;
}

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  color: '#000000',
  fontFamily: 'Kumbh Sans',
  marginLeft:'10px',
  marginRight:'10px',

  
  '&.Mui-selected': {
    color: '#000000',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

export default function MyTabs({chosenmodule, setChosenModule, modules}: {chosenmodule: string, setChosenModule: (newValue: string) => void, modules: any[]}) {

   useEffect(() => {
    setChosenModule('All');
   }, [])

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setChosenModule(newValue);
    };

    return (
        <StyledTabs
            value={chosenmodule}
            onChange={handleChange}
            aria-label="styled tabs example"
        >
            <StyledTab 
                    key={0} 
                    label={'All'} 
                    value={'All'}  // Use ModuleName as value instead of index
                />
            {modules.map((module, index) => (
                <StyledTab 
                    key={index} 
                    label={module.ModuleName} 
                    value={module.ModuleName}  // Use ModuleName as value instead of index
                />
            ))}
        </StyledTabs>
    );
}
