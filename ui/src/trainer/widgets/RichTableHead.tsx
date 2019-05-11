import React from 'react';
import { TableHead, TableRow, TableCell, Checkbox } from '@material-ui/core';

interface Header {
  id: string;
  label: string;
}

interface RichTableHeadProps {
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  numSelected: number;
  rowCount: number;
  headers: Header[];
}

const RichTableHead = ({ onSelectAll, numSelected, rowCount, headers }: RichTableHeadProps) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={numSelected === rowCount}
            onChange={onSelectAll}
          />
        </TableCell>
        {headers.map(col => (
          <TableCell key={col.id} align="left">
            {col.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default RichTableHead;
