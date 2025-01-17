import React from 'react'
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/material';

interface FormControlProps {
  singleitem: string;
  setSingleItem: (value: string) => void;
  items: string[];
  label: string;
  customSelectStyle: SxProps<Theme>;
  isitemdisabled?: boolean;

}

const FormControlSelect: React.FC<FormControlProps> = ({singleitem, setSingleItem, isitemdisabled, items, label, customSelectStyle}) => {
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
      {items.map((item) => (
        <MenuItem key={item} value={item}>{item}</MenuItem>
      ))}
    </Select>
  </FormControl>  )
}

export default FormControlSelect