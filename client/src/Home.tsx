import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import DrawerComponent from './Drawer';
import Table from './Table';
import { useAuth } from './UseContext/MainAuth';
import { useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import Report from './Report';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Notification from './Notification';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';

export default function Home() {

  console.log('home re rendered')

  
  
  const { versions, setVersions, setOpenDialog } = useAuth();

const drawerWidth = 240;
const [open, setOpen] = React.useState(false);
const [distinctVendors, setDistinctVendors] = React.useState<string[]>([]);
const [lastSync, setLastSync] = React.useState<string>('');
const [finishedSyncing, setFinishedSyncing] = React.useState(false);
const [failedSyncing, setFailedSyncing] = React.useState(false);
const [isSyncing, setIsSyncing] = React.useState(false);
const [openNotification, setOpenNotification] = React.useState(false);
const [readnotifications, setReadnotifications] = React.useState<boolean>(false);
const [versions_near_eosl, setVersionsNearEosl] = React.useState<any[]>([]);
const [openSubscribe, setOpenSubscribe] = React.useState<boolean>(false);


useEffect(() => {
    axios.get('http://localhost:3001/api/versions',{
    })
    .then(response => response.data)
    .then(data => {setVersions(data.versions)
      console.log('data',data.versions_near_eosl)
      
  })
    .catch(error => console.error('Error fetching versions:', error));

    console.log('fetching versions', versions);
    const now = new Date();
    setLastSync(now.toLocaleString('he-IL'));
    
  

    //create distinct vendors
  
    
    
}, []);





useEffect(() => {
  if (versions) {
    const distinctVendors = [...new Set(versions.map((version: any) => version.VendorName))];
    console.log('distinct vendors', distinctVendors);
    setDistinctVendors(distinctVendors);
    const versions_near_eosl = versions.filter((version: any) => {
      const endDate = new Date(version.EndOfSupportDate);
      endDate.setDate(endDate.getDate() + 1);
      
      return endDate <= new Date(new Date().setDate(new Date().getDate() + 30)) 
          && endDate >= new Date();
    });
    
    console.log('versions_near_eosl', versions_near_eosl);
    setVersionsNearEosl(versions_near_eosl);
    setReadnotifications(false);
  }
}, [versions]);


const handleSync = async () => {
  setIsSyncing(true);
  const response = await axios.get('http://localhost:3001/api/sync');
  console.log('response', response);
  setVersions(response.data.versions);
  //take now date and time
  if(response.data.sync){
    const now = new Date();
    setLastSync(now.toLocaleString('he-IL'));
    setFinishedSyncing(true);
    setIsSyncing(false);
    setTimeout(() => {
      setFinishedSyncing(false);
    }, 10000);

  }
  else{
    setFailedSyncing(true);
    setIsSyncing(false);

  setTimeout(() => {
    setFailedSyncing(false);
  }, 10000);
}
}

const onCloseNotification = () => {
  setOpenNotification(false);
  setReadnotifications(true);
}

const onCloseSubscribe = () => {
  setOpenSubscribe(false);
}

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth-50}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));



  return (
    
    <Box sx={{ display: 'flex' }}>

<Report versions={versions? versions: []}/>

      <DrawerComponent open={open} setOpen={setOpen}/>

      <Main open={open}>
      <Grid container style={{gap:'30px', marginTop:'20px'}}>
        <Grid container item xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>
          <Grid container item xs={6} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row',}}>
    
            <Grid item xs={4} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
             
             
             <Box sx={{display:'flex', backgroundColor:'#509CDB', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px', cursor:'pointer'}} onClick={() => setOpenDialog(true)}>
                <Typography  sx={{ color: '#FFF', fontSize:'14px', fontWeight:'600', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans' }}>
                    Report Issue
                </Typography>
             </Box>

            </Grid>
            <Grid item xs={4} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column',margin:0}}>
             
            <Box sx={{display:'flex', backgroundColor:'#FFF', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px', cursor:'pointer'}} onClick={async()=> await handleSync()}>
                <Typography  sx={{ color: '#2671B1', fontFamily:'Kumbh Sans' }}>
                    Sync Versions
                </Typography>
                {isSyncing && <CircularProgress sx={{color:'#2671B1', marginLeft:'10px',marginTop:'5px'}} size={16}/>}
                {!isSyncing && finishedSyncing && <CheckIcon sx={{color:'#2671B1', marginLeft:'10px'}} />}
                {!isSyncing && failedSyncing && <ErrorIcon sx={{color:'#2671B1', marginLeft:'10px'}} />}

             </Box>
            </Grid>
            <Grid item xs={4} style={{display:'flex', justifyContent:'center', alignItems:'flex-start', flexDirection:'column'}}>
                <Typography sx={{color:'#2671B1', fontFamily:'Kumbh Sans', fontSize:'12px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px',flexGrow:1}}>last sync: {lastSync}</Typography>
            </Grid>
          </Grid>
          <Grid item xs={6} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
           
           <Box sx={{ position: 'relative' }}>
             <Box onClick={() => setOpenNotification(!openNotification)} sx={{cursor:'pointer'}}>
             
             {readnotifications ? <NotificationsOutlinedIcon sx={{color:'#2D88D4'}}/> : <NotificationsActiveOutlinedIcon sx={{color:'#2D88D4'}}/>}

             </Box>
             
             <Notification 
               open={openNotification} 
               onClose={onCloseNotification}    
               versions_near_eosl={versions_near_eosl}
               type='notifications'
               versions={versions? versions: []}
             />
           </Box>
           <Grid item xs={4} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
             
             <Box sx={{display:'flex', backgroundColor:'#FFF', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px', cursor:'pointer'}} onClick={() => {
              if(!openSubscribe){
                return setOpenSubscribe(true);
              }
            
             }}>
                 <Typography  sx={{ color: '#424242', fontSize:'14px', fontWeight:'600', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans' }}>
                     Subscribe to Notifications
                 </Typography>
                 <Notification
                 open={openSubscribe}
                 onClose={onCloseSubscribe}
                 versions_near_eosl={versions_near_eosl}
                 type='subscribe'
                 distinctVendors={distinctVendors}
                 versions={versions? versions: []}
                 />
              </Box>
             </Grid>

          </Grid>
        </Grid>
      
        <Grid container xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', paddingLeft:'80px'}}>

            <Table versions={versions? versions: []}  distinctVendors={distinctVendors} setDistinctVendors={setDistinctVendors} />
       
       </Grid>
      </Grid>
      </Main>
    </Box>
  );
}
