import * as React from 'react';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputBase from '@mui/material/InputBase';

const BootstrapInput = styled(InputBase)(({ theme }) => ({

    //insert pa

  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      'Kumbh Sans',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}));

interface CustomizedSelectsProps {
  options: string[];
  label: string;
  value: string;
  setVendor: (value: string) => void;
  style: React.CSSProperties;
}

const CustomizedSelects: React.FC<CustomizedSelectsProps> = ({options, label, value, setVendor, style}) => {

  return (
    <div>
      
      <FormControl sx={style} variant="standard">
        <Select
          labelId="custom-select-label"
          id="custom-select"
          value={value}
          onChange={(e) => setVendor(e.target.value)}
          input={<BootstrapInput />}
          displayEmpty
          renderValue={(selected) => {
            if (!selected || selected === '') {
              return <em style={{ color: '#C4C4C4' }}>{label}</em>;
            }
            return selected;
          }}
        >
            <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {options.map((option: string) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>

    </div>
  );
}

export default CustomizedSelects;