class Http {
  static handleRequestError(
    error: any,
    onResponseReceived: (status: number, data: any) => string
  ) {
    if (error.response) {
      return onResponseReceived(error.response.status, error.response.data);
    } else if (error.request) {
      return "Couldn't reach the server";
    }
    return "There was an error setting up the request";
  }
}

export default Http;
