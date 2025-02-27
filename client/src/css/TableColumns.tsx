import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';


interface Column {
    id: 'VersionName' | 'ProductName' | 'VendorName' | 'ReleaseDate' | 'EndOfSupportDate' | 'Extended_Support_End_Date' | 'LevelOfSupport' 
    label: string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
    format_number?: (value: number) => string;
    format_date?: (value: string) => string;
    format_product?: (value: string) => string;
  }
  
  const columns: readonly Column[] = [
    { id: 'VersionName', label: 'Version Name', minWidth: 140, align:'left', format_product: (value: string) => value.replace(/_/g, ' ') },
    { id: 'ProductName', label: 'Product Name', minWidth: 100, align:'left', format_product: (value: string) => value.replace(/_/g, ' ') },
    {
      id: 'VendorName',
      label: 'Vendor Name',
      minWidth: 100,
      
      
      align: 'left',
      format_number: (value: number) => value.toLocaleString('en-US'),
    },
    {
      id: 'ReleaseDate',
      label: 'Version Release Date',
      minWidth: 140,
      align: 'left',
      format_date: (value: string) => new Date(value).toLocaleString('he-IL').split(',')[0]
    },
    {
      id:'LevelOfSupport',
      label:'Level Of Support',
      minWidth:140,
      align:'left',
      format_number: (value: number) => value.toLocaleString('en-US'),
    },
    {
      id: 'EndOfSupportDate',
      label: 'Version EOL',
      minWidth: 140,
      align: 'left',
      format_date: (value: string) => new Date(value).toLocaleString('he-IL').split(',')[0]
    },
    {
      id: 'Extended_Support_End_Date',
      label: 'Version Partial EOL',
      minWidth: 140,
      align: 'left',
      format_date: (value: string) => new Date(value).toLocaleString('he-IL').split(',')[0]
    },
  
  
  
  ];

  
const AnimatedGrid = styled(Grid)<{ animate?: boolean }>`
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

animation: ${({ animate }) => animate ? 'fadeIn 0.5s ease-out' : 'none'};
`;

  export {columns, AnimatedGrid};