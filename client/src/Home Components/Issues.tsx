import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Box, Grid } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import IssuesTable from './IssuesTable';
import { useEffect, useState } from 'react';
import Popup from '../Help Components/Popup';

interface IssuesProps {
  chosenproduct: any;
  issuesdialog: boolean;
  setIssuesDialog: any;
  chosenversion: any;
}

export default function Issues({chosenproduct, issuesdialog, setIssuesDialog, chosenversion }: IssuesProps) {



  useEffect(() => {
    setIsPopupOpen(false);
  }, [issuesdialog]);

    const [ispopupopen, setIsPopupOpen] = useState(false);
    const [issucceeded, setIssucceeded] = useState(false);
    const [title, setTitle] = useState('');
    const [mainMessage, setMainMessage] = useState('');
    const [subMessage, setSubMessage] = useState('');
    const [buttonText, setButtonText] = useState('');



    const handlePopup= (title: string, message: string, isSuccess: boolean, buttonText: string) => {
      setIsPopupOpen(true);
      setTitle(title);
      setMainMessage(message);
      setButtonText(buttonText);
      setIssucceeded(isSuccess);
  }


  return (
    <React.Fragment>
      <Dialog
        open={issuesdialog}
        onClose={() => setIssuesDialog(false)}
        maxWidth="lg"
        fullWidth={true}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
          }
        }}
        PaperProps={{
          sx: {
            width: '90vw',
            height: '90vh',
            maxWidth: 'none',
            margin: '20px',
          }
        }}
        >
               {ispopupopen && (
          <Popup
            ispopupopen={ispopupopen}
            setIsPopupOpen={setIsPopupOpen}
            issucceeded={issucceeded}
            setIssucceeded={setIssucceeded}
            title={title}
            setTitle={setTitle}
            mainMessage={mainMessage}
            setMainMessage={setMainMessage}
            subMessage={subMessage}
            setSubMessage={setSubMessage}
            buttonText={buttonText}
           setButtonText={setButtonText}
        />
      )}
    
        <DialogContent sx={{ p: 0}}>
          <Box sx={{
            width: '100%',
            height: '100%',
            opacity: ispopupopen ? 0.5 : 1,
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CancelIcon 
                  sx={{
                    color: '#152259', 
                    cursor: ispopupopen ? 'default' : 'pointer', 
                    fontSize: '35px',
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 1
                  }} 
                  onClick={() => ispopupopen ? setIsPopupOpen(false) : setIssuesDialog(false)}
                />
              </Grid>
              <Grid item xs={12}>
                <IssuesTable chosenproduct={chosenproduct} chosenversion={chosenversion} ispopupopen={ispopupopen} setIsPopupOpen={setIsPopupOpen} handlePopup={handlePopup} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

