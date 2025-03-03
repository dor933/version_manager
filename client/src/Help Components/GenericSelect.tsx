import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { GenericSelectProps } from '../Component Props/HelpComponentsProps';



export default function GenericSelect({singleitem, isitemdisabled, ispopupopen, setSingleItem, options}: GenericSelectProps) {
    return (
        <Select 
        labelId="version-label"
        label="Version"
        value={singleitem}
        sx={{width:'100%', fontFamily:'Kumbh Sans', fontWeight:'500', fontSize:'14px', color:'#152259'}}
        required
        disabled={isitemdisabled || ispopupopen}
        onChange={(e) => setSingleItem(e.target.value)}
    >
        {
            options.map((option) => (
                <MenuItem value={option}>{option}</MenuItem>
            ))
        }
    </Select>
    )
}

