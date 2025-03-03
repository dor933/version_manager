import React from 'react';
import { Box, Typography } from '@mui/material';
import { ButtonProps } from '../Component Interfaces/HelpComponentsProps';

export default function CustomButton({label, onClick, opacity=1, ispopupopen}: ButtonProps) {
    return (
        <Box 
        sx={{
          display: label=='View Photos'? 'inline-flex':'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#509CDB',
          borderRadius: '4px',
          opacity: ispopupopen ? 0.5 : 1,
          padding: '5px 10px',
          cursor: ispopupopen ? 'default' : 'pointer',
          '&:hover': {
            backgroundColor: '#4084C2'
          },
          minWidth: label=='View Photos'? 'fit-content' : '100%'
        }} 
        onClick={onClick}
      >
        <Typography sx={{ 
          color: '#FFF',
          fontSize: '14px',
          fontWeight: '600',
          lineHeight: '16px',
          letterSpacing: '0.2px',
          textAlign: 'center',
          fontFamily: 'Kumbh Sans'
        }}>
          {label}
        </Typography>
        </Box>   
        
    )
}