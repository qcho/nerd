import React from "react";
import { MenuItem, DialogContent, Select } from "@material-ui/core";
import { Type } from "../apigen";

type EntityDialogProps = {
  value: string;
  onTypeChange: any;
  options: { [key: string]: Type };
};

const EntityDialog = (props: EntityDialogProps) => {
  let { value, onTypeChange, options } = props;
  let optionWidgets = Object.keys(options).map((code: string) => {
    return (
      <MenuItem key={code} value={code}>
        {options[code].label}
      </MenuItem>
    );
  });
  return (
    <>
      <DialogContent>
        <Select value={value} onChange={onTypeChange}>
          {optionWidgets}
        </Select>
      </DialogContent>
    </>
  );
};

export default EntityDialog;
