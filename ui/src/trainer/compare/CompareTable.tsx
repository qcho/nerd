/* eslint-disable @typescript-eslint/camelcase */
import React, { useState } from 'react';
import { MaybeSnapshot } from '../types/optionals';
import { NerApi, NerCompare, NerCompareResult, SpacyDocument, Snapshot } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { RichTable, DatasourceParameters } from '../rich_table/RichTable';
import { CompareTableCell } from './CompareTableCell';

interface Props {
  firstSnapshotVersion: string;
  secondSnapshotVersion: string;
  highlightDifferent: boolean;
}

const entitiesDiffer = (first: SpacyDocument, second: SpacyDocument) => {
  const firstEnts = first.ents || [];
  const secondEnts = second.ents || [];
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
};

const CompareTable = ({ firstSnapshotVersion, secondSnapshotVersion, highlightDifferent }: Props) => {
  const [firstSnapshot, setFirstSnapshot] = useState<MaybeSnapshot>(null);
  const [secondSnapshot, setSecondSnapshot] = useState<MaybeSnapshot>(null);

  const api = new NerApi(apiConfig());
  const headers = [
    { id: firstSnapshotVersion, label: firstSnapshotVersion },
    { id: secondSnapshotVersion, label: secondSnapshotVersion },
  ];

  var id = 0;
  const valueToId = (value: any) => `${id++}`;

  const rowBuilder = () => {
    const highlightColor = '#EFDECD';
    const inner = (row: NerCompare) => {
      const { first, second, text_id } = row;
      const highlightStyle =
        highlightDifferent && entitiesDiffer(first, second) ? { backgroundColor: highlightColor } : {};
      return (
        <>
          <CompareTableCell
            highlightStyle={highlightStyle}
            id={text_id}
            snapshot={firstSnapshot as Snapshot}
            document={first}
          />
          <CompareTableCell
            highlightStyle={highlightStyle}
            id={text_id}
            snapshot={secondSnapshot as Snapshot}
            document={second}
          />
        </>
      );
    };
    return inner;
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

  return (
    <RichTable headers={headers} valueToId={valueToId} rowBuilder={rowBuilder()} datasource={datasource} paginatable />
  );
};

export { CompareTable };
