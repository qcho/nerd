import React, { useState } from 'react';
import { TableCell, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { TokenizedEditor } from '../token_editor/TokenizedEditor';
import { SpacyDocument, SpacyDocument1, CorpusApi, Snapshot } from '../apigen';
import { apiConfig } from '../helpers/api-config';

interface Props {
  highlightStyle: {
    backgroundColor?: string | undefined;
  };
  id: string;
  document: SpacyDocument1;
  snapshot: Snapshot;
}

const CompareTableCell = ({ highlightStyle, id, document, snapshot }: Props) => {
  const [innerDocument, setInnerDocument] = useState<SpacyDocument1>(document);
  const [dirty, setDirty] = useState<boolean>(false);
  const [fixed, setFixed] = useState<boolean>(false);
  const [t] = useTranslation();
  const corpusApi = new CorpusApi(apiConfig());

  const onUpdate = (newDocument: SpacyDocument) => {
    setInnerDocument({ ...newDocument });
    setDirty(true);
    setFixed(false);
  };
  const isCurrent = snapshot.id == 0;
  const highlightColor = dirty && !fixed ? '#800020' : '#8DB600';
  const backgroundHighlightColor = `${highlightColor + '11'}`;

  const onFix = async () => {
    try {
      await corpusApi.addTextTraining(id, innerDocument);
      setFixed(true);
    } catch (e) {
      // TODO: Handle error
    } finally {
      setDirty(false);
    }
  };

  return (
    <TableCell style={highlightStyle}>
      <div
        style={
          ((dirty || fixed) && {
            border: `2px solid ${highlightColor}`,
            borderRadius: '8px',
            padding: '0 2px 8px 2px',
            backgroundColor: backgroundHighlightColor,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }) || { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
        }
      >
        <TokenizedEditor
          readOnly={!isCurrent}
          spacyDocument={innerDocument}
          entityTypes={snapshot.types || {}}
          smallText
          onUpdate={onUpdate}
        />
        {isCurrent && (
          <Button disabled={!dirty} style={dirty || fixed ? { marginTop: '8px' } : {}} onClick={onFix}>
            {t('Fix')}
          </Button>
        )}
      </div>
    </TableCell>
  );
};

export { CompareTableCell };
