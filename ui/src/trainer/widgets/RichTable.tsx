import React, { useState, useCallback, useEffect } from 'react';
import usePagination from '../hooks/usePagination';
import {
  Grid,
  Table,
  TableBody,
  TableFooter,
  TableRow,
  TablePagination,
  TableCell,
  Checkbox,
  CircularProgress,
} from '@material-ui/core';
import TableToolbar from './TableToolbar';
import RichTableHead from './RichTableHead';

function xorSelected<T>(selected: T[], entry: T) {
  const selectedIndex = selected.indexOf(entry);
  var newSelected: T[] = [];

  if (selectedIndex === -1) {
    newSelected = newSelected.concat(selected, entry);
  } else if (selectedIndex === 0) {
    newSelected = newSelected.concat(selected.slice(1));
  } else if (selectedIndex === selected.length - 1) {
    newSelected = newSelected.concat(selected.slice(0, -1));
  } else if (selectedIndex > 0) {
    newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
  }
  return newSelected;
}

export interface DatasourceResult {
  headers?: { [id: string]: string } | null;
  records: any[];
}

export interface DatasourceParameters {
  searchText?: string;
  page?: number;
  pageSize?: number;
}

interface Props {
  title?: string;
  searchable?: boolean;
  paginatable?: boolean;
  headers: { id: string; label: string }[];
  valueToId: (value: any) => string;
  datasource: ({ searchText, page, pageSize }: DatasourceParameters) => Promise<DatasourceResult | undefined | void>;
  rowBuilder: (data: any) => JSX.Element;
  onDelete?: (rows: any[]) => Promise<void>;
}

const RichTable = ({ title, headers, valueToId, rowBuilder, datasource, onDelete, searchable, paginatable }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);
  const { page, total, pageSize, setPage, setPageSize, setFromHeaders, shouldPaginate } = usePagination();
  let unmounted = false;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await datasource({
      searchText,
      page,
      pageSize,
    });
    if (unmounted) return;
    setLoading(false);
    if (!result) return;
    setRecords(result.records);
    if (result.headers) {
      setFromHeaders(result.headers);
    }
  }, [datasource, page, pageSize, searchText, setFromHeaders, unmounted]);

  const handleChangePage = (event: any, page: number) => {
    setPage(page + 1);
  };

  const handleChangeRecordsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setPageSize(+event.target.value);
  };

  async function onDeleteClick() {
    if (!onDelete) return;
    const toDelete = records.filter(value => selected.indexOf(valueToId(value)) !== -1);
    await onDelete(toDelete);
    setSelected([]);
    fetchData();
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchText]);

  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      setSelected(records.map(value => valueToId(value)));
    } else {
      setSelected([]);
    }
  };

  const isSelected = (record: any) => selected.indexOf(valueToId(record)) !== -1;
  const handleRowClick = (record: any) => setSelected(xorSelected(selected, valueToId(record)));

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container>
      {(searchable || title || selected.length > 0) && (
        <Grid item xs={12}>
          <TableToolbar
            onSearch={searchable && setSearchText}
            title={title}
            numSelected={selected.length}
            onDelete={onDelete && onDeleteClick}
          />
        </Grid>
      )}

      <Table>
        <RichTableHead
          onSelectAll={onDelete && handleSelectAll}
          headers={headers}
          numSelected={selected.length}
          rowCount={records.length}
        />
        <TableBody>
          {records.map((record: any) => {
            const rowSelected = isSelected(record);
            return (
              <TableRow key={valueToId(record)} hover role="checkbox" selected={rowSelected} tabIndex={-1}>
                {onDelete && (
                  <TableCell padding="checkbox">
                    <Checkbox checked={rowSelected} onClick={() => handleRowClick(record)} />
                  </TableCell>
                )}
                {rowBuilder(record)}
              </TableRow>
            );
          })}
        </TableBody>
        {paginatable && shouldPaginate && (
          <TableFooter>
            <TableRow>
              <TablePagination
                count={total}
                page={page - 1}
                rowsPerPageOptions={[20, 50, 100]}
                rowsPerPage={pageSize}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRecordsPerPage}
              />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </Grid>
  );
};

export { RichTable };
