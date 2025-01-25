import React from 'react';
import Tooltip from '@mui/material/Tooltip';


export function InfoSVG(){
    return (
        <Tooltip title="Release Notes" placement="bottom" arrow style={{fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans'}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#A7A7A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8V13" stroke="#A7A7A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.9945 16H12.0035" stroke="#A7A7A7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        </Tooltip>
    )
}




