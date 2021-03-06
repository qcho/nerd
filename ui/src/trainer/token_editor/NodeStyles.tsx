import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';

const useNodeStyles = makeStyles(() => ({
  node: {
    display: 'inline-block',
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
    '&::selection': {
      background: grey[400],
    },
  },
  hoverCursor: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  arrowCursor: {
    '&:hover': {
      cursor: 'default',
    },
  },
}));

export { useNodeStyles };
