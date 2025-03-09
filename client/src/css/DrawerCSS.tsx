import { styled } from "@mui/material/styles";
import MuiAppBar from '@mui/material/AppBar';
import { AppBarProps } from '../Component Props/RootComponentsProps';

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
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    }));
    
    
    export { AppBar, DrawerHeader };