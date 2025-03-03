import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

interface NotificationSelectProps {
    singleitem: string;
    setSingleItem: (value: string) => void;
    items: string[];
    label: string;
    customSelectStyle: SxProps<Theme>;
    isitemdisabled?: boolean;

  }

  interface NotificationProps {
    open: boolean;
    onClose: () => void;
    versions_to_notify: any[];
    type: string;
    distinctVendors?: string[];
    versions: any[];
  }

  interface PopupProps {
    ispopupopen: boolean;
    setIsPopupOpen: (value: boolean) => void;
    issucceeded: boolean;
    setIssucceeded: (value: boolean) => void;
    title: string;
    setTitle: (value: string) => void;
    mainMessage: string;
    setMainMessage: (value: string) => void;
    subMessage: string;
    setSubMessage: (value: string) => void;
    buttonText: string;
    setButtonText: (value: string) => void;
}   

interface PhotosCompProps {
  photos: string[];
  isphotosopen: boolean;
  setIsPhotosOpen: (open: boolean) => void;
}

interface ImageHandlerProps { 
  setImages: (images: File[]) => void;
  handleAddPhotos?: () => void;
  isreport?: boolean;
  ispopupopen?: boolean;
}

interface GenericSelectProps {
  singleitem: string;
  isitemdisabled: boolean;
  ispopupopen: boolean;
  setSingleItem: (value: string) => void;
  options: string[];
}

interface ButtonProps {
  label: string;
  onClick: () => void;
  opacity?: number;
  ispopupopen?: boolean;
}


interface FilterProps { 
  filtervalue: string;
  setFiltervalue: (value: string) => void;
}

interface CustomizedSelectsProps {
  options: string[];
  label: string;
  value: string;
  setVendor: (value: string) => void;
  style: React.CSSProperties;
}

  export type { NotificationSelectProps, NotificationProps, PopupProps, ButtonProps, PhotosCompProps, ImageHandlerProps, GenericSelectProps, FilterProps, CustomizedSelectsProps };