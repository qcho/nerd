import { useState, useEffect } from 'react';
import useReactRouter from 'use-react-router';
import { parse, stringify, parseUrl } from 'query-string';
import { Pagination } from '../types/Pagination';

function buildHash(page: number, pageSize: number) {
  return {
    page,
    // eslint-disable-next-line @typescript-eslint/camelcase
    page_size: pageSize,
  };
}

export default function usePagination() {
  const { location, history } = useReactRouter();
  const queryValues = parse(location.hash);
  const [page, setPage] = useState<number>(queryValues.page != undefined ? +queryValues.page : 1);
  const [pageSize, setPageSize] = useState<number>(queryValues.page_size != undefined ? +queryValues.page_size : 20);
  const [total, setTotal] = useState<number>(0);
  const [shouldPaginate, setShouldPaginate] = useState<boolean>(false);
  const recordsPerPageOptions = [20, 50, 100];

  useEffect(() => {
    if (!shouldPaginate && location.hash.length > 0) {
      history.replace(location.pathname);
      return;
    }
  }, [history, location.hash.length, location.pathname, shouldPaginate]);
  useEffect(() => {
    const newLocation = `${location.pathname}#${stringify(buildHash(page, pageSize))}`;
    if (location.hash.length == 0 && total > 0) {
      history.replace(newLocation);
    } else {
      if (shouldPaginate && (queryValues.page != `${page}` || queryValues.page_size != `${pageSize}`)) {
        history.push(newLocation);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  function setFromHeaders(headers: { [id: string]: string }) {
    if (headers['x-pagination'] != undefined) {
      const pagination: Pagination = JSON.parse(headers['x-pagination']);
      setPage(pagination.page);
      setTotal(pagination.total);
      setShouldPaginate(pagination.total_pages > 1);
    }
  }

  return {
    page,
    pageSize,
    total,
    shouldPaginate,
    setPage,
    setPageSize,
    recordsPerPageOptions,
    setFromHeaders,
  };
}
