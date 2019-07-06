import React, { useState } from 'react';
import { Typography, TableCell } from '@material-ui/core';
import { Worker, SnapshotsApi } from '../apigen';
import AsyncSelect from 'react-select/async';
import { apiConfig } from '../helpers/api-config';

const WorkerRow = ({ worker }: { worker: Worker }) => {
  const [value, setValue] = useState<string>(worker.snapshot);
  const [newVersion, setNewVersion] = useState<string>(worker.snapshot);
  const api = new SnapshotsApi(apiConfig());

  const loadOptions = async (inputValue: string) => {
    try {
      const snapshots = (await api.listCorpusSnapshots(1, 100)).data;
      return snapshots.map(snapshot => {
        const value = `v${snapshot.id == 0 ? 'CURRENT' : snapshot.id}`;
        return { value: value, label: value };
      });
    } catch {
      // TODO
    } finally {
      // TODO
    }
  };

  const handleInputChange = (newValue: string) => {
    const inputValue = newValue.replace(/\W/g, '');
    setValue(inputValue);
    return inputValue;
  };

  return (
    <>
      <TableCell>
        <Typography>{worker.name}</Typography>
      </TableCell>
      <TableCell>
        <div>
          <AsyncSelect
            loadOptions={loadOptions}
            onInputChange={handleInputChange}
            cacheOptions
            defaultOptions
            defaultValue={{ value: worker.snapshot, label: worker.snapshot }}
          />
        </div>
      </TableCell>
    </>
  );
};

export { WorkerRow };
