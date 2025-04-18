import React from 'react'
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { NotificationSelectProps } from '../Component Props/HelpComponentsProps';



export default function FormControlSelect({singleitem, setSingleItem, isitemdisabled, items, label, customSelectStyle}: NotificationSelectProps) {
  return (
    <FormControl fullWidth>
    <InputLabel id="version-label" sx={{ fontFamily: 'Kumbh Sans' }}>{label}</InputLabel>
    <Select 
      labelId="version-label"
      label="Version"
      value={singleitem}
      onChange={(e) => setSingleItem(e.target.value)}
      disabled={isitemdisabled? isitemdisabled : false}
      sx={customSelectStyle}
    >
      {label!=='Unit' &&
      <MenuItem value={`All ${label}s`}>{`All ${label}s`}</MenuItem>
      }
      {items.map((item) => (
        <MenuItem key={item} value={item}>{item.replace(/_/g, ' ')}</MenuItem>
      ))}
    </Select>
  </FormControl>  )
}

