import MaterialTable, { MTableCell } from "@material-table/core"; // TODO: Replace it with another library. Headless UI library would be better.
import styled from "styled-components";

import VerticalAlignBottomIcon from "@material-ui/icons/VerticalAlignBottom";
import { Toolbar } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { useToasts } from "react-toast-notifications";
import { CSVDownloader } from "react-papaparse";
import { AnyTodo, DocumentVerification } from "sardine-dashboard-typescript-definitions";
import { StyledTitleName } from "../Dashboard/styles";

const EmptyTextContainer = styled.div`
  text-align: left;
`;

// Type definition is based on Column<RowData extends object> in material-table.
// export interface Column<RowData extends object> {
export interface DataColumn<RowData> {
  field?: keyof RowData | string;
  filtering?: boolean;
  grouping?: boolean;
  render?: (data: RowData, type?: "row" | "group") => React.ReactNode;
  title?: string;
  type?: "numeric";
  editable?: "never";
}

// Subset of DataColumn. It does not have <RowData>
export interface DataColumnSimple {
  field?: string;
  title?: string;
  type?: "numeric";
  editable?: "never";
}

// If you want to use another RowData type, feel free to add like this: export type RowData = DocumentVerification | NewRowDataType;
export type RowData = DocumentVerification;

type PushToDetailsFunc = (event: MouseEvent, rowData: RowData) => void;
export const useHandleRowClick = (pushToDetails: PushToDetailsFunc): PushToDetailsFunc => {
  const { addToast } = useToasts();

  const copiedToast = () => {
    addToast("Selected text copied!", {
      appearance: "info",
      autoDismiss: true,
    });
  };

  const handleRowClick = (e: MouseEvent, r: RowData) => {
    const selection = window.getSelection()?.toString() || "";
    if (selection.length > 0) {
      navigator.clipboard.writeText(selection).then(copiedToast, () => {
        window.clipboardData.setData("Text", selection);
        copiedToast();
      });
    } else {
      pushToDetails(e, r);
    }
  };

  return handleRowClick;
};

const defaultOptions = {
  rowStyle: {
    padding: "1px",
    fontSize: "13px",
  },
  cellStyle: {
    fontSize: 13,
    width: "max-content",
    fontWeight: "500",
  },
  pageSize: 15,
  pageSizeOptions: [15, 30, 60],
  filtering: false,
  search: false,
  grouping: true,
  exportButton: { csv: true, pdf: false },
  exportAllData: true,
  editable: "never",
  headerStyle: {
    backgroundColor: "#FAFBFD",
    fontSize: 13,
    width: "max-content",
    fontWeight: "bold",
  },
};

const defaultLocalization = {
  body: {
    emptyDataSourceMessage: <EmptyTextContainer>No records to display</EmptyTextContainer>,
  },
};

const tableTheme = createTheme({
  overrides: {
    MuiTableRow: {
      hover: {
        "&:hover": {
          color: "#fff",
          backgroundColor: "#325078 !important",
        },
      },
    },
    MuiTable: {
      root: {
        minWidth: "-webkit-fill-available",
      },
    },
  },
});

interface Editable {
  onRowAdd?: (newData: AnyTodo, oldData?: AnyTodo) => Promise<AnyTodo>;
  onRowUpdate?: (newData: AnyTodo, oldData?: AnyTodo) => Promise<AnyTodo>;
  onRowDelete?: (newData: AnyTodo, oldData?: AnyTodo) => Promise<AnyTodo>;
}

export interface MaterialTableComponents {
  Toolbar?: (props: AnyTodo) => JSX.Element | null;
  Cell?: (props: AnyTodo) => JSX.Element | null;
}

interface DataTableProps {
  columns: DataColumn<AnyTodo>[];
  components?: MaterialTableComponents;
  data: AnyTodo[];
  detailPanel?: (rowData: AnyTodo) => JSX.Element;
  editable?: Editable;
  isLoading?: boolean;
  localization?: AnyTodo;
  onChangePage?: (page: number, pageSize: number) => void;
  onFilterChange?: (rowData: AnyTodo) => void;
  onRowClick?: (event: AnyTodo, rowData: AnyTodo) => void;
  options?: AnyTodo;
  title: string;
}

export const DataTable = (props: DataTableProps): JSX.Element => {
  const {
    columns,
    components,
    data,
    detailPanel,
    editable,
    isLoading,
    localization,
    options,
    onChangePage,
    onFilterChange,
    onRowClick,
    title,
  } = props;
  return (
    <ThemeProvider theme={tableTheme}>
      <MaterialTable
        components={components}
        data={data}
        detailPanel={detailPanel}
        options={{ ...defaultOptions, ...options }}
        localization={{
          body: { ...defaultLocalization.body, ...localization?.body },
          ...localization,
        }}
        columns={columns}
        isLoading={isLoading}
        onPageChange={onChangePage}
        onFilterChange={onFilterChange}
        onRowClick={onRowClick}
        editable={editable}
        title={title}
      />
    </ThemeProvider>
  );
};

// Wrapper for material-table Cell.
// If you want to replace material-table with another library, please modify this component.
export const DataCell = (props: {
  id: string;
  rowData: AnyTodo;
  columnDef: AnyTodo;
  cellEditable: boolean;
  errorState: AnyTodo;
  icons: AnyTodo;
  onCellEditStarted: AnyTodo;
  scrollWidth: number;
  size: "medium";
  value: string;
}): JSX.Element => {
  const { id, rowData, columnDef, cellEditable, errorState, icons, onCellEditStarted, scrollWidth, size, value } = props;

  return (
    <MTableCell
      id={id}
      data-tid={id}
      rowData={rowData}
      columnDef={columnDef}
      cellEditable={cellEditable}
      errorState={errorState}
      icons={icons}
      onCellEditStarted={onCellEditStarted}
      scrollWidth={scrollWidth}
      size={size}
      value={value}
    />
  );
};

// MTToolbar's wrapper
export const ToolBarWrapper = (props: { title: string; data: AnyTodo[] }): JSX.Element => {
  const { title, data } = props;
  const filename = title ? title.toLowerCase().replaceAll(" ", "_") : "table";

  return (
    <Toolbar>
      <div
        style={{
          flex: "1 1 10%",
        }}
      />

      <CSVDownloader
        data={data}
        type="button"
        filename={filename}
        style={{
          border: "none",
          background: "white",
        }}
        bom
      >
        <VerticalAlignBottomIcon />
      </CSVDownloader>
    </Toolbar>
  );
};

export const ToolBarWithTitle = (props: { title: string; data: AnyTodo[] }): JSX.Element => {
  const { data, title } = props;
  return (
    <div
      style={{
        justifyContent: "space-between",
        display: "flex",
        padding: "20px 20px",
      }}
    >
      <StyledTitleName>{title}</StyledTitleName>
      <ToolBarWrapper data={data} title={title} />
    </div>
  );
};
