import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';



export default function Home() {


const drawerWidth = 240;
const theme = useTheme();
const [open, setOpen] = React.useState(false);

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

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({

  variants: [
    {
      props: ({ open }) => open,
      style: {
   
      },
    },
  ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));



  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        open={open} 
        sx={{ 
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '& .MuiToolbar-root': {
            minHeight: '48px',
          }
        }}
      >
        <Toolbar>
          <IconButton
            color='primary'
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                mr: 2,
                padding: '8px',
                backgroundColor:'#FFF',
                borderRadius:'4px',
                border:'1px solid #E0E0E0',
                transition:'all 0.3s ease',
                marginTop:'10px',
                marginLeft:'10px',
                '&:hover': {
                  backgroundColor:'#F5F5F5',
                },

              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
      
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#152259',
            fontFamily:'Kumbh Sans',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon sx={{ color: '#FFFFFF' }} /> : <ChevronRightIcon sx={{ color: '#FFFFFF' }} />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Dashboard', 'Vendors', 'Reports', 'Drafts'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon sx={{ color: '#FFFFFF' }} /> : <MailIcon sx={{ color: '#FFFFFF' }} />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ color: '#FFFFFF', fontFamily:'Kumbh Sans' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon sx={{ color: '#FFFFFF' }} /> : <MailIcon sx={{ color: '#FFFFFF' }} />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ color: '#FFFFFF', fontFamily:'Kumbh Sans' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <DrawerHeader />

      <Main open={open}>
      <Grid container>
        <Grid container item xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>
          <Grid container item xs={4} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row',}}>
    
            <Grid item xs={5} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
             
             <Box sx={{display:'flex', backgroundColor:'#509CDB', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px'}}>
                <Typography  sx={{ color: '#FFF', fontSize:'14px', fontWeight:'600', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans' }}>
                    Report Issue
                </Typography>
             </Box>

            </Grid>
            <Grid item xs={5} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column',margin:0}}>
             
            <Box sx={{display:'flex', backgroundColor:'#FFF', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px'}}>
                <Typography  sx={{ color: '#2671B1', fontFamily:'Kumbh Sans' }}>
                    See Versions
                </Typography>
             </Box>
            </Grid>
          </Grid>
          <Grid item xs={8} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
           
           <Grid item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'flex-end', flexDirection:'column'}}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.73 21C13.5544 21.3033 13.3021 21.5552 12.9985 21.7302C12.6948 21.9053 12.3505 21.9974 12 21.9974C11.6495 21.9974 11.3052 21.9053 11.0015 21.7302C10.6979 21.5552 10.4456 21.3033 10.27 21M18.134 11C18.715 16.375 21 18 21 18H3C3 18 6 15.867 6 8.4C6 6.703 6.632 5.075 7.757 3.875C8.883 2.675 10.41 2 12 2C12.337 2 12.672 2.03 13 2.09L18.134 11ZM19 8C19.7956 8 20.5587 7.68393 21.1213 7.12132C21.6839 6.55871 22 5.79565 22 5C22 4.20435 21.6839 3.44129 21.1213 2.87868C20.5587 2.31607 19.7956 2 19 2C18.2044 2 17.4413 2.31607 16.8787 2.87868C16.3161 3.44129 16 4.20435 16 5C16 5.79565 16.3161 6.55871 16.8787 7.12132C17.4413 7.68393 18.2044 8 19 8Z" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <ellipse cx="5.4" cy="5.4" rx="5.4" ry="5.4" transform="matrix(-1 0 0 1 22.7998 0)" fill="#2D88D4"/>
</svg>

           </Grid>
           <Grid item xs={4} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
             
             <Box sx={{display:'flex', backgroundColor:'#FFF', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px'}}>
                 <Typography  sx={{ color: '#424242', fontSize:'14px', fontWeight:'600', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans' }}>
                     Log Out
                 </Typography>
              </Box>
             </Grid>

          </Grid>
        </Grid>
      </Grid>
      </Main>
    </Box>
  );
}
