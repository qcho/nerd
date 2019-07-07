class Http {
  public static handleRequestError(error: any, onResponseReceived: (status: number, data: any) => string) {
    const serverUnreachable = "Couldn't reach the server";
    const serverError = 'There was a server error while processing a request';
    if (error.response) {
      const { status, data } = error.response;
      if (status == 504) {
        return serverUnreachable;
      }
      if (status == 500) {
        return serverError;
      }
      return onResponseReceived(status, data);
    } else if (error.request) {
      return serverUnreachable;
    }
    return 'There was an error setting up the request';
  }
}

export default Http;
