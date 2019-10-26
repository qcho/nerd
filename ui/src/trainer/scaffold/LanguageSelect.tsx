import React from 'react';
import { Select, MenuItem, FormControl } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';

const color = '#FFF';

const useStyle = makeStyles({
  select: {
    '&:before': {
      borderColor: color,
    },
    '&:after': {
      borderColor: color,
    },
  },
  icon: {
    fill: color,
  },
  root: {
    color,
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'uppercase',
  },
});

const LanguageSelect = () => {
  const [t, i18next] = useTranslation();
  const classes = useStyle();
  const i18n = i18next as any;

  const onChange = (event: any) => {
    i18n.changeLanguage(event.target.value);
    window.location.reload();
  };

  return (
    <Select
      value={i18n.languages[0]}
      onChange={onChange}
      className={classes.select}
      disableUnderline
      inputProps={{
        classes: {
          root: classes.root,
          icon: classes.icon,
        },
      }}
    >
      <MenuItem value={'en'}>{t('English')}</MenuItem>
      <MenuItem value={'es'}>{t('Spanish')}</MenuItem>
    </Select>
  );
};

export { LanguageSelect };
