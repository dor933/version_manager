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
        style={{
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width:'100%',
          height:'100%',
         
          zIndex:'1000',
        }}
        maxWidth="lg"
        fullWidth={true}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
          }
        }}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const email = formJson.email;
            console.log(email);
            setIssuesDialog(false);
          },
          sx: {
            width: '1300px',
            height: '100%',
          }
        }}
      >
        <DialogContent>
        <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', paddingLeft:'20px', paddingRight:'20px', paddingTop:'20px', paddingBottom:'20px',}}>
        <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

          <Grid item xs={12}>
          <CancelIcon sx={{color:'#152259', cursor:'pointer', fontSize:'35px'}} onClick={() => setIssuesDialog(false)}/>

          </Grid>

          <Grid item xs={12} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
          <IssuesTable chosenproduct={chosenproduct} chosenversion={chosenversion} />
          </Grid>





          </Grid>


          </Box>

        </DialogContent>
      </Dialog>
    </React.Fragment>
    )
}

