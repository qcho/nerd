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
  Grid,
  Typography
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import NerEditor from "./trainer/widgets/NerEditor";
import { NerDocument } from "./trainer/types/NerDocument";
import { dummyNodeProvider } from "./trainer/helpers/nodeproviders";

let styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    grow: {
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
        <AppBar position="static">
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              NER Trainer
            </Typography>
            {/* <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          <Grid container direction="column" justify="space-around">
            <Grid item>
              <Grid container direction="row" spacing={24} alignItems="center">
                <Grid item xs={10}>
                  <TextField
                    label="Text"
                    type="search"
                    margin="normal"
                    variant="outlined"
                    multiline
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
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    color="primary"
                    onClick={this.onParseClick.bind(this)}
                  >
                    Parse
                  </Button>
                </Grid>
              </Grid>
              <Divider style={{ marginTop: 10, marginBottom: 10 }} />
            </Grid>
          </Grid>
          <Grid item>
            {this.state.document == null ? (
              <div />
            ) : (
              <Grid
                container
                direction="row"
                spacing={24}
                justify="space-between"
              >
                <Grid item xs={10}>
                  <NerEditor
                    document={this.state.document!}
                    onUpdate={this.onDocumentUpdate.bind(this)}
                    nodeProvider={dummyNodeProvider}
                  />
                </Grid>
                <Grid
                  item
                  xs={2}
                  style={{
                    marginTop: 2,
                    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
                    padding: "0.5em"
                  }}
                >
                  <Button variant="contained" fullWidth color="primary">
                    Save
                  </Button>
                </Grid>
              </Grid>
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