import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import DrawerComponent from './Drawer';
import Table from './Home Components/Table';
import { useMain } from './UseContext/MainContext';
import { useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Report from './Home Components/Report';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Notification from './Help Components/Notification';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { apiService } from './API/apiService';
import { Main } from './css/HomeCSS'

export default function Home() {
  
const { versions, setVersions, setOpenDialog } = useMain();
const [open, setOpen] = React.useState(false);
const [distinctVendors, setDistinctVendors] = React.useState<string[]>([]);
const [lastSync, setLastSync] = React.useState<string>('');
const [finishedSyncing, setFinishedSyncing] = React.useState(false);
const [failedSyncing, setFailedSyncing] = React.useState(false);
const [isSyncing, setIsSyncing] = React.useState(false);
const [openNotification, setOpenNotification] = React.useState(false);
const [readNotifications, setReadNotifications] = React.useState<boolean>(false);
const [versionsToNotify, setVersionsToNotify] = React.useState<any[]>([]);
const [openSubscribe, setOpenSubscribe] = React.useState<boolean>(false);
const [productsAndModules, setProductsAndModules] = React.useState<any>(null);


useEffect(() => {
    apiService.getVersions()
    .then(response => {setVersions(response.data.versions)
      setProductsAndModules(response.data.productsandmodules)

      console.log('versions', response.data.versions)
      console.log('productsandmodules', response.data.productsandmodules)
    
  })
    .catch(error => console.error('Error fetching versions:', error));

    const now = new Date();
    setLastSync(now.toLocaleString('he-IL'));
    
    

}, []);





useEffect(() => {
  if (versions) {
    const distinctVendors = [...new Set(versions.map((version: any) => version.VendorName))];
    setDistinctVendors(distinctVendors);
    const versions_near_eosl = versions.filter((version: any) => {
      const endDate = new Date(version.EndOfSupportDate);
      
      return endDate <= new Date(new Date().setDate(new Date().getDate() + 30)) 
          && endDate >= new Date();
    });

    const versions_newer_than_2_days = versions.filter((version: any) => {

      if(versions_near_eosl.some((v: any) => v.VersionName === version.VersionName && v.ProductName === version.ProductName)){
        return false;
      }

      const timestamp = new Date(version.Timestamp);
      return timestamp >= new Date(new Date().setDate(new Date().getDate() - 2));
    });

    versions_near_eosl.forEach((version) => {
      version.is_new = false;
    });

    versions_newer_than_2_days.forEach((version) => {
      version.is_new = true;
    });

    const merged_versions = [...versions_near_eosl, ...versions_newer_than_2_days];
    setVersionsToNotify(merged_versions);
    setReadNotifications(false);
  }
}, [versions]);



const handleSync = async () => {
  setIsSyncing(true);
  const response = await apiService.syncVersions();
  setVersions(response.data.versions);
  //taking date and time
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
  setReadNotifications(true);
}

const onCloseSubscribe = () => {
  setOpenSubscribe(false);
}









  return (
    
    <Box sx={{ display: 'flex' }}>

<Report versions={versions? versions: []} productsandmodules={productsAndModules} />
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
             
             {readNotifications ? <NotificationsOutlinedIcon sx={{color:'#2D88D4'}}/> : <NotificationsActiveOutlinedIcon sx={{color:'#2D88D4'}}/>}

             </Box>
             
             <Notification 
               open={openNotification} 
               onClose={onCloseNotification}    
               versions_to_notify={versionsToNotify}
               type='notifications'
               versions={versions? versions: []}
             
             />
           </Box>
           <Grid item xs={4} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
             
             <Box sx={{display:'flex', backgroundColor:'#509CDB', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px', cursor:'pointer' }} onClick={() => {
              if(!openSubscribe){
                return setOpenSubscribe(true);
              }
            
             }}>
                 <Typography  sx={{ color: '#FFFFFF', fontSize:'14px', fontWeight:'600', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans' }}>
                     Subscribe to Notifications
                 </Typography>
                 <Notification
                 open={openSubscribe}
                 onClose={onCloseSubscribe}
                 versions_to_notify={versionsToNotify}
                 type='subscribe'
                 distinctVendors={distinctVendors}
                 versions={versions? versions: []}
               
                 />
              </Box>
             </Grid>

          </Grid>
        </Grid>
      
        <Grid container xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', paddingLeft:'80px'}}>

            <Table versions={versions? versions: []}  distinctVendors={distinctVendors} productsandmodules={productsAndModules} />
       
       </Grid>
      </Grid>
      </Main>
    </Box>
  );
}
