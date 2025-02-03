import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Box, Grid } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import IssuesTable from './IssuesTable';

export default function Issues({chosenproduct, issuesdialog, setIssuesDialog, chosenversion }: { chosenproduct: any, issuesdialog: boolean, setIssuesDialog: any, chosenversion: any}) {
  return (
    <React.Fragment>
      <Dialog
        open={issuesdialog}
        onClose={() => setIssuesDialog(false)}
        maxWidth="xl"
        fullWidth={true}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
          }
        }}
        PaperProps={{
          sx: {
            width: '95vw',
            height: '90vh',
            maxWidth: 'none',
            margin: '20px',
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{
            width: '100%',
            height: '100%',
            p: 3,
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CancelIcon 
                  sx={{
                    color: '#152259', 
                    cursor: 'pointer', 
                    fontSize: '35px',
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 1
                  }} 
                  onClick={() => setIssuesDialog(false)}
                />
              </Grid>
              <Grid item xs={12}>
                <IssuesTable chosenproduct={chosenproduct} chosenversion={chosenversion} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

