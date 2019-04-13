import React from 'react';
import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
} from "@material-ui/core";

type RichTableHeadProps = {
  onSelectAll: any;
  numSelected: number;
  rowCount: number;
  headers: any[];
};

const RichTableHead = ({
  onSelectAll,
  numSelected,
  rowCount,
  headers
}: RichTableHeadProps) => {
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