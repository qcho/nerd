import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles, Theme } from "@material-ui/core/styles";
import "./App.css";
import {
  AppBar,
  Toolbar,
  IconButton,
  createStyles,
  TextField,
  Divider,
  Button,
  Grid
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import NerEditor from "./trainer/widgets/NerEditor";
import { NerDocument } from "./trainer/types/NerDocument";
import { textNodeProvider as dummyNodeProvider } from "./trainer/helpers/nodeproviders";

let styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexGrow: 1
    },
    appBar: {
      zIndex: theme.zIndex.drawer
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing.unit * 3
    },
    toolbar: theme.mixins.toolbar
  });

type Props = {
  classes: any;
};

type State = {
  document?: NerDocument;
  text: string;
};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      text: ""
    };
  }

  render() {
    let { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={classes.appBar}>
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            {/* <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Grid container direction="column"
            justify="space-around"
           >
            <Grid item>
              <TextField
                label="Text"
                type="search"
                margin="normal"
                variant="outlined"
                fullWidth
                value={this.state.text}
                onChange={event => {
                  let text = event.target.value;
                  if (!text || !text.length) {
                    return;
                  }
                  this.setState({ text });
                }}
              />
              <Button
                fullWidth
                color="primary"
                onClick={this.onParseClick.bind(this)}
              >
                Parse
              </Button>
              <Divider style={{ marginTop: 10, marginBottom: 10 }} />
            </Grid>
          </Grid>
          <Grid item>
            {this.state.document == null ? (
              <div />
            ) : (
              <div>
                <NerEditor
                  document={this.state.document!}
                  onUpdate={this.onDocumentUpdate.bind(this)}
                  nodeProvider={dummyNodeProvider}
                />
                <Button variant="contained" fullWidth color="primary">
                  Save
                </Button>
              </div>
            )}
          </Grid>
        </main>
      </div>
    );
  }

  onParseClick() {
    fetch(`http://localhost:5000/models/noticias/ner?text=${this.state.text}`)
      .then((response: Response) => {
        response.json().then((data: any) => {
          this.setState({ document: data });
        });
      })
      .catch((err: any) => {
        console.log("Fuuu", err);
      });
  }

  onDocumentUpdate(document: NerDocument) {
    this.setState({ document });
  }
}

export default withStyles(styles)(App);
