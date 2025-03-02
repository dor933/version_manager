import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyledTabs, StyledTab } from '../css/TabsStyle';






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
