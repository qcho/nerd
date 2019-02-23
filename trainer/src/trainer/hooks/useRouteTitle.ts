import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";

export default function useRouteTitle(location: any) {
    const [t] = useTranslation(nsps.routeTitles);
    const pathname = location.pathname;
    if (pathname == "/") {
        return t("Named entity recognizer")
    }
    if (pathname == "/preview") {
        return t("NER preview")
    }
    return "";
}
