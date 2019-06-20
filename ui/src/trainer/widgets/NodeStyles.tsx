import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';

const useNodeStyles = makeStyles(() => ({
  node: {
    display: 'inline-block',
    marginTop: '0.2em',
  },
  leftMargin: {
    marginLeft: '0.2em',
  },
  leftPadding: {
    paddingLeft: '0.2em',
  },
  hoverBackground: {
    '&:hover': {
      background: grey[400],
    },
  },
  hoverCursor: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

export { useNodeStyles };
