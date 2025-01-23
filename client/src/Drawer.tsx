import { Drawer, styled, Toolbar } from '@mui/material';
import React from 'react';
import { IconButton } from '@mui/material';
import { Divider } from '@mui/material';
import { List } from '@mui/material';
import { ListItem } from '@mui/material';
import { ListItemButton } from '@mui/material';
import { ListItemIcon } from '@mui/material';
import { ListItemText } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Inbox, Mail } from '@mui/icons-material';
import { Menu } from '@mui/icons-material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

interface DrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function DrawerComponent({ open, setOpen }: DrawerProps) {
    const theme = useTheme();
    
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
                
        <>
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
            <Menu />
          </IconButton>
      
        </Toolbar>
      </AppBar> 
        <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
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
            {theme.direction === 'ltr' ? <ChevronLeft sx={{ color: '#FFFFFF' }} /> : <ChevronRight sx={{ color: '#FFFFFF' }} />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Dashboard'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <Inbox sx={{ color: '#FFFFFF' }} /> : <Mail sx={{ color: '#FFFFFF' }} />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ color: '#FFFFFF', fontFamily:'Kumbh Sans' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        {/* <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <Inbox sx={{ color: '#FFFFFF' }} /> : <Mail sx={{ color: '#FFFFFF' }} />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ color: '#FFFFFF', fontFamily:'Kumbh Sans' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List> */}
      </Drawer>
      <DrawerHeader />           
    </>
    )

}


