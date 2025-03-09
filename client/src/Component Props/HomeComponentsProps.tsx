import { VersionData } from "../Types/MainDataTypes";

interface TabsProps {

    chosenmodule: string;
    setChosenModule: (newValue: string) => void;
    modules: any[];
}

interface TableProps {

    versions: VersionData[];
    distinctVendors: string[];
    productsandmodules: any[];
  }
  
  interface ReportProps {
    versions: any;
    productsandmodules: any;
    setProductsAndModules: (newValue: any) => void;
}

interface IssuesTableProps {
    chosenproduct: any;
    chosenversion: any;
    ispopupopen: boolean;
    setIsPopupOpen: (ispopupopen: boolean) => void;
    handlePopup: (title: string, message: string, isSuccess: boolean, buttonText: string) => void;
  }


  interface IssuesProps {
    chosenproduct: any;
    issuesdialog: boolean;
    setIssuesDialog: any;
    chosenversion: any;
  }

  export type { TabsProps, TableProps, ReportProps, IssuesTableProps, IssuesProps };