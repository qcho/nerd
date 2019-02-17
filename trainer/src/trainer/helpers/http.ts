export class Http {
    static baseURL = "http://localhost:5000";

    static urlFor(path: string): string {
        let trimmedPath = path.trim();
        if (trimmedPath.length == 0) {
            trimmedPath = "/";
        } else if (trimmedPath[0] != '/') {
            trimmedPath = "/" + trimmedPath;
        }
        return Http.baseURL + trimmedPath;
    }
}
