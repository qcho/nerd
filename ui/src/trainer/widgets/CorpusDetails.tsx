import React, { useState, useEffect } from 'react';
import { NERdCorpus } from '../apigen';
import { useTranslation } from 'react-i18next';
import nsps from '../helpers/i18n-namespaces';
import { Grid, Typography, CircularProgress } from '@material-ui/core';
import moment from 'moment';

const CorpusDetails = ({ model }: { model: NERdCorpus }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [details, setDetails] = useState<any>({});
    const [t] = useTranslation(nsps.modelManagement);

    useEffect(() => {
      const fetchDetails = async () => {
        // TODO(jpo): We need this endpoint.
        // ModelApi.details(modelName)
        //   .then(data => {
        //     setDetails(data);
        //   })
        //   .catch(error => {
        //     console.log("Couldn't get model details", [error]);
        //   })
        //   .finally(() => setLoading(false));
      };
      setLoading(true);
      fetchDetails();
    }, []);

    if (loading) {
      return (
        <Grid container direction={"column"}>
          <Grid item>
            <Grid container direction={"row"} alignItems={"center"} spacing={8}>
              <Grid item>
                <Typography>{"Status: TRAINING"}</Typography>
              </Grid>
              <Grid item>
                <CircularProgress size={15} variant="indeterminate" />
              </Grid>
            </Grid>
          </Grid>
          <Grid item direction={"column"} spacing={8}>
            <Grid item>
              <Typography>{"Last trained:"}</Typography>
            </Grid>
            <Grid item>
              <Typography>
                {moment()
                  .subtract(10, "days")
                  .fromNow()}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      );
      // return <div>Loading...</div>;
    }
    return (
      <div>
        <Typography>
          {t("Queued: {{count}}", { count: details.queued })}
        </Typography>
        <Typography>
          {t("Trained: {{count}}", { count: details.trained })}
        </Typography>
      </div>
    );
  };

export default CorpusDetails;
