import { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

interface DrawerProps {
    open: boolean;
    setOpen: (open: boolean) => void;
  }

  interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
  }


  export type { DrawerProps, AppBarProps };