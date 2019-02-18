export default function useRouteTitle(location: any) {
    const pathname = location.pathname;
    if (pathname == "/") {
        return "Named entity recognizer"
    }
    if (pathname == "/preview") {
        return "NER preview"
    }
    return "";
}
