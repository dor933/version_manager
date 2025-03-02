interface Column {
    id: 'VersionName' | 'Issue' | 'Photos' | 'Severity' | 'Issue Status' | 'DateField' | 'Resolution' | 'Workaround' | 'Add Photos'
    label: string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
    format_number?: (value: number) => string;
    format_date?: (value: Date) => string;
    format_product?: (value: string) => string;
  
  }

  const columns: readonly Column[] = [
    { id: 'VersionName', label: 'Version Name', minWidth: 120, format_product: (value: string) => value.replace(/_/g, ' ') },

    {
      id: 'Issue',
      label: 'Description',
      minWidth: 140,
      align: 'left',
      format_product: (value: string) => value
    },

    {
      id: 'Severity',
          label: 'Severity',
      minWidth: 100,
      align: 'left',
      format_product: (value: string) => value
    },
    {
      id: 'DateField',
          label: 'Date',
      minWidth: 100,
      align: 'left',
      format_date: (value: Date) => value.toLocaleString('he-IL').split(',')[0]
    },
    {
      id: 'Resolution',
      label: 'Resolution',
      minWidth: 140,
      align: 'left',
      format_product: (value: string) => value
    },

    {
        id:'Photos',
        label:'Photos',
        minWidth:140,
        align:'left',
        format_product: (value: string) => value
    },
    {
        id:'Workaround',
        label:'Workaround',
        minWidth:140,
        align:'left',
        format_product: (value: string) => value
    },
    {
        id:'Add Photos',
        label:'Add Photos',
        minWidth:140,
        align:'left',
        format_product: (value: string) => value
    } 
  
  ];

  export default columns;