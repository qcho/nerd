import React from "react";
import { EntityType } from "../types/EntityType";
import {
  MenuItem,
  DialogContent,
  Select,
} from "@material-ui/core";

type EntityDialogProps = {
  value: string;
  onTypeChange: any;
  options: EntityType[];
};

const EntityDialog = (props: EntityDialogProps) => {
  let { value, onTypeChange, options } = props;
  let optionWidgets = options.map((option: EntityType) => {
    return <MenuItem key={option.code} value={option.code}>{option.name}</MenuItem>;
  });
  return (
    <div>
      <DialogContent>
        <Select value={value} onChange={onTypeChange}>
          {optionWidgets}
        </Select>
      </DialogContent>
    </div>
  );
};

export default EntityDialog;
