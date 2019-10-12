import React, { useState, useEffect, ChangeEvent } from 'react';
import { Scaffold } from '../scaffold/Scaffold';
import { useTranslation } from 'react-i18next';
import { ChooseSnapshots, ChooseResult } from './ChooseSnapshots';
import { NerApi, NerCompare, NerCompareResult, SnapshotsApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { RichTable, DatasourceParameters, DatasourceResult } from '../rich_table/RichTable';
import { TableCell, FormControlLabel, Switch } from '@material-ui/core';
import { TokenizedEditor } from '../token_editor/TokenizedEditor';
import { MaybeSnapshot } from '../types/optionals';

interface Props {
  firstSnapshotVersion: string;
  secondSnapshotVersion: string;
  hideEqual: boolean;
}

const CompareTable = ({ firstSnapshotVersion, secondSnapshotVersion, hideEqual }: Props) => {
  const [firstSnapshot, setFirstSnapshot] = useState<MaybeSnapshot>(null);
  const [secondSnapshot, setSecondSnapshot] = useState<MaybeSnapshot>(null);

  const api = new NerApi(apiConfig());
  const headers = [
    { id: firstSnapshotVersion, label: firstSnapshotVersion },
    { id: secondSnapshotVersion, label: secondSnapshotVersion },
  ];

  var id = 0;
  const valueToId = (value: any) => `${id++}`;

  const buildRow = (row: NerCompare) => {
    const { first, second } = row;
    return (
      <>
        <TableCell>
          <TokenizedEditor
            readOnly
            spacyDocument={first}
            entityTypes={(firstSnapshot && firstSnapshot.types) || {}}
            smallText
          />
        </TableCell>
        <TableCell>
          <TokenizedEditor
            readOnly
            spacyDocument={second}
            entityTypes={(secondSnapshot && secondSnapshot.types) || {}}
            smallText
          />
        </TableCell>
      </>
    );
  };

  const datasource = async ({ page, pageSize }: DatasourceParameters) => {
    const response = await api.nerCompare(firstSnapshotVersion, secondSnapshotVersion, page, pageSize);
    const result: NerCompareResult = response.data;
    setFirstSnapshot(result.first_snapshot);
    setSecondSnapshot(result.second_snapshot);
    return {
      data: result.results,
      headers: response.headers,
    };
  };

  const filterResults = (datasource: (parameters: DatasourceParameters) => Promise<DatasourceResult>) => {
    async function wrapper(params: DatasourceParameters) {
      var result = await datasource(params);
      var results = result.data;
      results = results.filter(value => {
        const firstEnts = value.first.ents || [];
        const secondEnts = value.second.ents || [];
        if (firstEnts.length == 0 && secondEnts.length == 0) return false;
        if (firstEnts.length != secondEnts.length) return true;

        const longestEnts = firstEnts.length > secondEnts.length ? firstEnts : secondEnts;
        const shortestEnts = firstEnts.length > secondEnts.length ? secondEnts : firstEnts;

        for (const firstEntity of longestEnts) {
          var found = false;
          for (const secondEntity of shortestEnts) {
            if (
              firstEntity.start == secondEntity.start &&
              firstEntity.end == secondEntity.end &&
              firstEntity.label == secondEntity.label
            ) {
              found = true;
              break;
            }
          }
          if (!found) {
            return true;
          }
        }
        return false;
      });
      result.data = results;
      return result;
    }
    return wrapper;
  };
  return (
    <RichTable
      headers={headers}
      valueToId={valueToId}
      rowBuilder={buildRow}
      datasource={hideEqual ? filterResults(datasource) : datasource}
      paginatable
    />
  );
};

const CompareSnapshots = () => {
  const [t] = useTranslation();
  const [snapshotsToCompare, setSnapshotsToCompare] = useState<ChooseResult | null>(null);
  const [hideEqual, setHideEqual] = useState<boolean>(true);

  const onHideSameChange = (event: ChangeEvent, checked: boolean) => {
    setHideEqual(checked);
  };

  return (
    <Scaffold title={t('Compare snapshots')}>
      <div>
        <div>
          <ChooseSnapshots onChange={setSnapshotsToCompare} />
          <FormControlLabel
            checked={hideEqual}
            label={t('Show only differences')}
            labelPlacement="start"
            control={<Switch color="primary" onChange={onHideSameChange} />}
          />
        </div>
        <div>
          {snapshotsToCompare != null && (
            <CompareTable
              firstSnapshotVersion={snapshotsToCompare.from}
              secondSnapshotVersion={snapshotsToCompare.to}
              hideEqual={hideEqual}
            />
          )}
        </div>
      </div>
    </Scaffold>
  );
};

export { CompareSnapshots };
