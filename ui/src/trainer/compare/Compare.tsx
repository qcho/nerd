import React, { useState, useEffect, ChangeEvent } from 'react';
import { Scaffold } from '../scaffold/Scaffold';
import { useTranslation } from 'react-i18next';
import { ChooseSnapshots, ChooseResult } from './ChooseSnapshots';
import { NerApi, NerCompare, NerCompareResult, SnapshotsApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { RichTable, DatasourceParameters } from '../rich_table/RichTable';
import { TableCell, FormControlLabel, Switch } from '@material-ui/core';
import { TokenizedEditor } from '../token_editor/TokenizedEditor';
import { MaybeSnapshot } from '../types/optionals';

const CompareSnapshots = () => {
  const [t] = useTranslation();
  const [snapshotsToCompare, setSnapshotsToCompare] = useState<ChooseResult | null>(null);
  const [hideEqual, setHideEqual] = useState<boolean>(true);
  const [firstSnapshot, setFirstSnapshot] = useState<MaybeSnapshot>(null);
  const [secondSnapshot, setSecondSnapshot] = useState<MaybeSnapshot>(null);

  const api = new NerApi(apiConfig());

  const headers =
    snapshotsToCompare == null
      ? []
      : [
          { id: snapshotsToCompare.from, label: snapshotsToCompare.from },
          { id: snapshotsToCompare.to, label: snapshotsToCompare.to },
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
    if (snapshotsToCompare == null) return;
    const response = await api.nerCompare(snapshotsToCompare.from, snapshotsToCompare.to, page, pageSize);
    const result: NerCompareResult = response.data;
    setFirstSnapshot(result.first_snapshot);
    setSecondSnapshot(result.second_snapshot);
    var results = result.results;
    console.log(hideEqual);
    if (hideEqual) {
      results.filter(value => {
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
          if (!found) return true;
        }
        return true;
      });
    }
    return {
      data: results,
      headers: response.headers,
    };
  };

  const onHideSameChange = (event: ChangeEvent, checked: boolean) => {
    setHideEqual(checked);
  };

  return (
    <Scaffold title={t('Compare snapshots')}>
      <div>
        <div>
          <ChooseSnapshots onChange={setSnapshotsToCompare} />
          <FormControlLabel
            label="Esconder iguales"
            labelPlacement="start"
            control={<Switch color="primary" onChange={onHideSameChange} />}
          />
        </div>
        <div>
          {snapshotsToCompare != null && (
            <RichTable
              headers={headers}
              valueToId={valueToId}
              rowBuilder={buildRow}
              datasource={datasource}
              paginatable
            />
          )}
        </div>
      </div>
    </Scaffold>
  );
};

export { CompareSnapshots };
