import React, { useState } from "react";
import useReactRouter from "use-react-router";

import NavigationBar from "../NavigationBar";
import { LinearProgress, Theme } from "@material-ui/core";

type Props = {
  match: any;
};

const TrainCorpus = ({ match }: Props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const { location } = useReactRouter();
  const { corpus } = match.params;
  return (
    <div>
      <NavigationBar />
      {loading && <LinearProgress />}
    </div>
  );
};

export default TrainCorpus;
