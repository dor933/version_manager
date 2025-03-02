import React from 'react';
import { Select, MenuItem } from '@mui/material';

const GenericSelect = ({singleitem, isitemdisabled, ispopupopen, setSingleItem, options}: {singleitem: string, isitemdisabled: boolean, ispopupopen: boolean, setSingleItem: (value: string) => void, options: string[]}) => {
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

export default GenericSelect;
