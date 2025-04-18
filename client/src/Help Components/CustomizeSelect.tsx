import * as React from 'react';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { CustomizedSelectsProps } from '../Component Props/HelpComponentsProps';
import { CustomizeSelectCSS } from '../css/CustomizeSelectCSS';




export default function CustomizedSelects({options, label, value, setVendor, style}: CustomizedSelectsProps) {

  return (
    <div>
      
      <FormControl sx={style} variant="standard">
        <Select
          labelId="custom-select-label"
          id="custom-select"
          value={value}
          onChange={(e) => setVendor(e.target.value)}
          input={<CustomizeSelectCSS />}
          displayEmpty
          renderValue={(selected) => {
            if (!selected || selected === '') {
              return <em style={{ color: '#C4C4C4' }}>{label.replace(/_/g, ' ')}</em>;
            }
            return selected.replace(/_/g, ' ');
          }}
        >
            <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {options.map((option: string) => (
            <MenuItem key={option} value={option}>{option.replace(/_/g, ' ')}</MenuItem>
          ))}
        </Select>
      </FormControl>

    </div>
  );
}

