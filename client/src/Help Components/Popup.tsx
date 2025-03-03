import React, { useState } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PopupProps } from '../Component Interfaces/HelpComponentsProps';



export default function Popup({
    ispopupopen,
    setIsPopupOpen,
    issucceeded,
    setIssucceeded,
    title,
    setTitle,
    mainMessage,
    setMainMessage,
    subMessage,
    setSubMessage,
    buttonText,
    setButtonText,
}: PopupProps) {

    const isSmall = useMediaQuery('(max-width:600px)');
    if (!ispopupopen) return null;


    return (
        <Box
            sx={{
            
                padding: '40px',
                position: 'fixed',
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 24,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1300,
            }}
        >
            <Grid container direction="column" alignItems="center" spacing={2} sx={{ paddingLeft: issucceeded? '0px' : '20px', paddingRight: issucceeded? '0px' : '20px' }}>
                <Grid item position="relative">
                    {issucceeded && (
                        <Box component="svg" width={isSmall ? 30 : 50} height={isSmall ? 30 : 50} viewBox="0 0 390 389" fill="none">
                            <path 
                                d="M368.455 215.212C354.558 284.699 302.165 350.128 228.647 364.749C192.792 371.889 155.597 367.535 122.36 352.307C89.1226 337.079 61.5369 311.753 43.5307 279.935C25.5245 248.117 18.0157 211.429 22.0735 175.095C26.1313 138.761 41.5488 104.634 66.1308 77.5722C116.551 22.0382 201.686 6.75099 271.173 34.5458" 
                                stroke="#20AE5C" 
                                strokeWidth="41.6923" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </Box>
                    )}
                    <Box position="absolute" top={isSmall ? 3.7 : 22} left={issucceeded ? 26 : 0}>
                        {issucceeded ? 
                            <CheckIcon fontSize={isSmall ? 'small' : 'large'} sx={{ color: 'green' }} /> :
                            <ErrorIcon fontSize={isSmall ? 'small' : 'large'} sx={{ color: 'red' }} />
                        }
                    </Box>
                </Grid>

                <Grid item textAlign="center" mt={issucceeded ? 0 : 3}>
                    <Typography 
                        variant="h1" 
                        fontSize={isSmall ? 15 : 25}
                        pt={isSmall ? 0 : 1}
                        color={issucceeded ? 'green' : 'red'}
                        fontFamily="Kumbh Sans"
                    >
                        {title}
                    </Typography>

                    <Typography 
                        fontSize={isSmall ? 12 : 15}
                        fontWeight="500"
                        mt={1}
                        fontFamily="Kumbh Sans"
                    >
                        {mainMessage}
                    </Typography>

                    {subMessage && (
                        <Typography 
                            fontSize={isSmall ? 12 : 15}
                            mt={1}
                            fontFamily="Kumbh Sans"
                        >
                            {subMessage}
                        </Typography>
                    )}

                    <Button 
                        variant="contained"
                        sx={{
                            height: 30,
                            width: 150,
                            mt: 3,
                            bgcolor: issucceeded ? 'green' : 'red',
                            color: 'white',
                            fontWeight: '500',
                            fontFamily: 'Kumbh Sans',
                            '&:hover': {
                                bgcolor: issucceeded ? 'darkgreen' : 'darkred'
                            }
                        }}
                        onClick={() => {
                            setIsPopupOpen(false);
                            setIssucceeded(false);
                            setTitle('');
                            setMainMessage('');
                            setSubMessage('');
                            setButtonText('');
                        }}
                    >
                        {buttonText}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}

